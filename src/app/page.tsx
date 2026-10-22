import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Badge variant="secondary">In costruzione</Badge>
      <h1 className="text-3xl font-semibold tracking-tight">LearnWithCybi</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ciao, sono Cybi!</CardTitle>
          <CardDescription>
            Impareremo insieme la cybersecurity, partendo da zero.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Il percorso parte dalla storia e arriva alle basi: come funzionano
          computer e reti, cosa vuol dire proteggerli.
        </CardContent>
        <CardFooter>
          <Button disabled>Inizia il percorso</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
