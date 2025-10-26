import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold mb-4">Parley</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Parent Teacher Chat Application
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
