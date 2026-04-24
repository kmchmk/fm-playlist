"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";

interface UserMenuProps {
  user: {
    name?: string;
    picture?: string;
    email?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-md border border-border">
      {user.picture && (
        <Image
          src={user.picture}
          alt={user.name || "User"}
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <span className="text-sm font-semibold text-foreground hidden sm:inline">
        {user.name || user.email}
      </span>
      <a
        href="/auth/logout"
        className="text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" strokeWidth={2.5} />
      </a>
    </div>
  );
}
