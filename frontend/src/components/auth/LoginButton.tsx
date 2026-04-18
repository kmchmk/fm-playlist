"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  return (
    <a href="/auth/login">
      <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-5 shadow-lg shadow-primary/30">
        <LogIn className="w-4 h-4 mr-2" strokeWidth={2.5} />
        Sign in with Google
      </Button>
    </a>
  );
}
