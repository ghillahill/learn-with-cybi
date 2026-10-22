import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import { lessonKey } from "./keys";
import {
  glossarySchema,
  lessonFrontmatterSchema,
  moduleManifestSchema,
  quizSchema,
  type GlossaryEntry,
  type LessonFrontmatter,
  type LessonStatus,
  type ModuleManifest,
  type Quiz,
} from "./schema";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export type Lesson = LessonFrontmatter & {
  key: string;
  moduleId: string;
  file: string;
  body: string;
  quizData: Quiz | null;
};

export type Module = Omit<ModuleManifest, "lessons"> & {
  dir: string;
  lessons: Lesson[];
};

export type Content = {
  modules: Module[];
  glossary: GlossaryEntry[];
};

export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`${path.relative(process.cwd(), file)}: ${detail}`);
    this.name = "ContentError";
  }
}

function parseWith<S extends z.ZodType>(
  schema: S,
  data: unknown,
  file: string,
): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `${i.path.join(".") || "(radice)"} → ${i.message}`)
      .join("; ");
    throw new ContentError(file, detail);
  }
  return result.data;
}

function readYaml(file: string): unknown {
  try {
    return parseYaml(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new ContentError(file, `YAML non valido: ${(err as Error).message}`);
  }
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function splitFrontmatter(
  source: string,
  file: string,
): { data: unknown; body: string } {
  const match = FRONTMATTER.exec(source);
  if (!match) throw new ContentError(file, "manca il frontmatter YAML (---)");
  try {
    return { data: parseYaml(match[1]), body: source.slice(match[0].length) };
  } catch (err) {
    throw new ContentError(
      file,
      `frontmatter non valido: ${(err as Error).message}`,
    );
  }
}

function loadLesson(moduleDir: string, moduleId: string, slug: string): Lesson {
  const file = path.join(moduleDir, "lessons", `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    throw new ContentError(
      path.join(moduleDir, "module.yaml"),
      `la lezione "${slug}" non esiste (${path.relative(process.cwd(), file)})`,
    );
  }
  const { data, body } = splitFrontmatter(fs.readFileSync(file, "utf8"), file);
  const meta = parseWith(lessonFrontmatterSchema, data, file);

  let quizData: Quiz | null = null;
  if (meta.quiz) {
    const quizFile = path.join(moduleDir, "quizzes", `${meta.quiz}.yaml`);
    if (!fs.existsSync(quizFile)) {
      throw new ContentError(file, `quiz "${meta.quiz}" non trovato`);
    }
    quizData = parseWith(quizSchema, readYaml(quizFile), quizFile);
    if (quizData.id !== meta.quiz) {
      throw new ContentError(quizFile, `l'id deve essere "${meta.quiz}"`);
    }
  }

  return {
    ...meta,
    key: lessonKey(moduleId, meta.id),
    moduleId,
    file,
    body,
    quizData,
  };
}

function loadModule(dir: string): Module {
  const manifestFile = path.join(dir, "module.yaml");
  const manifest = parseWith(
    moduleManifestSchema,
    readYaml(manifestFile),
    manifestFile,
  );
  const lessons = manifest.lessons.map((slug) =>
    loadLesson(dir, manifest.id, slug),
  );
  const ids = new Set<string>();
  for (const lesson of lessons) {
    if (ids.has(lesson.id)) {
      throw new ContentError(lesson.file, `id lezione duplicato "${lesson.id}"`);
    }
    ids.add(lesson.id);
  }
  return { ...manifest, dir, lessons };
}

export function loadContent(root: string = CONTENT_DIR): Content {
  const modulesDir = path.join(root, "modules");
  const modules = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadModule(path.join(modulesDir, entry.name)))
    .sort((a, b) => a.order - b.order);

  const moduleIds = new Set<string>();
  for (const mod of modules) {
    if (moduleIds.has(mod.id)) {
      throw new ContentError(mod.dir, `id modulo duplicato "${mod.id}"`);
    }
    moduleIds.add(mod.id);
  }
  for (const mod of modules) {
    for (const req of mod.requires) {
      if (!moduleIds.has(req)) {
        throw new ContentError(
          path.join(mod.dir, "module.yaml"),
          `requires: il modulo "${req}" non esiste`,
        );
      }
    }
  }

  const glossaryFile = path.join(root, "glossary.yaml");
  const glossary = parseWith(
    glossarySchema,
    readYaml(glossaryFile),
    glossaryFile,
  ).entries;

  return { modules, glossary };
}

// In sviluppo rilegge i file a ogni richiesta, così le modifiche ai contenuti
// si vedono subito; in produzione li legge una volta sola.
let cached: Content | null = null;
export function getContent(): Content {
  if (process.env.NODE_ENV !== "production") return loadContent();
  cached ??= loadContent();
  return cached;
}

// In produzione l'app mostra solo le lezioni pubblicate (§3.2).
// LWC_SHOW_DRAFTS=1 le mostra tutte, anche in una build di produzione.
export function showDrafts(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.LWC_SHOW_DRAFTS === "1"
  );
}

export function isVisible(status: LessonStatus): boolean {
  return showDrafts() || status === "pubblicata";
}

export function getVisibleModules(): Module[] {
  return getContent()
    .modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.filter((lesson) => isVisible(lesson.status)),
    }))
    .filter((mod) => mod.lessons.length > 0);
}

export function findModule(moduleId: string): Module | undefined {
  return getVisibleModules().find((mod) => mod.id === moduleId);
}

export function findLesson(
  moduleId: string,
  lessonId: string,
): { module: Module; lesson: Lesson; index: number } | undefined {
  const mod = findModule(moduleId);
  if (!mod) return undefined;
  const index = mod.lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1) return undefined;
  return { module: mod, lesson: mod.lessons[index], index };
}

export function getGlossary(): GlossaryEntry[] {
  return getContent().glossary;
}
