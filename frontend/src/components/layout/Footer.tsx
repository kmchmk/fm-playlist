"use client";

import { motion } from "motion/react";
import { formatMonthYear } from "@/lib/constants";

interface FooterProps {
  trackCount: number;
  selectedMonth: number;
  selectedYear: number;
}

export function Footer({ trackCount, selectedMonth, selectedYear }: FooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-16 text-center"
    >
      <p className="text-base font-bold text-muted-foreground">
        {trackCount} {trackCount === 1 ? "track" : "tracks"} in{" "}
        {formatMonthYear(selectedMonth, selectedYear)}
      </p>
    </motion.div>
  );
}
