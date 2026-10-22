import { checkContent } from "../src/lib/content/check";
import { loadContent } from "../src/lib/content/loader";

async function main() {
  const content = loadContent();
  const issues = await checkContent(content);
  const lessons = content.modules.reduce((n, m) => n + m.lessons.length, 0);

  if (issues.length > 0) {
    for (const issue of issues) console.error(`✗ ${issue.file}: ${issue.message}`);
    console.error(`\ncontent:check — ${issues.length} problemi.`);
    process.exit(1);
  }
  console.log(
    `content:check — ok (moduli: ${content.modules.length}, lezioni: ${lessons}, voci di glossario: ${content.glossary.length}).`,
  );
}

main().catch((err: Error) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
