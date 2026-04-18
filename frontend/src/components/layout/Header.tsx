"use client";

import { motion } from "motion/react";
import { UserMenu } from "@/components/auth/UserMenu";

interface HeaderProps {
  user?: {
    name?: string;
    picture?: string;
    email?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <div />
        {user && <UserMenu user={user} />}
      </div>
      <div className="text-center">
        <h1 className="text-6xl sm:text-8xl mb-4 font-black tracking-tight text-primary">
          FM Playlist
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          Share your favorite tracks, discover what&apos;s moving the FM crew
        </p>
      </div>
    </motion.div>
  );
}
