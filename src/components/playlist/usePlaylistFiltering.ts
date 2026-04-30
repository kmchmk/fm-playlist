"use client";

import { useCallback, useMemo } from "react";
import type { Song } from "@/types/song";
import { getCurrentMonth, getCurrentYear } from "@/lib/constants";

interface UsePlaylistFilteringOptions {
  songs: Song[];
  searchQuery: string;
  selectedYear: number;
  selectedMonth: number;
}

export function usePlaylistFiltering({
  songs,
  searchQuery,
  selectedYear,
  selectedMonth,
}: UsePlaylistFilteringOptions) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchMatchedSongs = useMemo(() => {
    if (!normalizedQuery) return songs;

    return songs.filter(
      (song) =>
        song.submitterName.toLowerCase().includes(normalizedQuery) ||
        (song.songTitle?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (song.artistName?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (song.description?.toLowerCase().includes(normalizedQuery) ?? false)
    );
  }, [songs, normalizedQuery]);

  const availableYears = useMemo(() => {
    const years = new Set(searchMatchedSongs.map((song) => song.year));
    if (!normalizedQuery) years.add(getCurrentYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [searchMatchedSongs, normalizedQuery]);

  const getAvailableMonthsForYear = useCallback(
    (year: number) => {
      const months = new Set(
        searchMatchedSongs
          .filter((song) => song.year === year)
          .map((song) => song.month)
      );

      if (!normalizedQuery && year === getCurrentYear()) {
        months.add(getCurrentMonth());
      }

      return Array.from(months).sort((a, b) => a - b);
    },
    [searchMatchedSongs, normalizedQuery]
  );

  const availableMonths = useMemo(
    () => getAvailableMonthsForYear(selectedYear),
    [getAvailableMonthsForYear, selectedYear]
  );

  const filteredSongs = useMemo(
    () =>
      searchMatchedSongs.filter(
        (song) => song.year === selectedYear && song.month === selectedMonth
      ),
    [searchMatchedSongs, selectedYear, selectedMonth]
  );

  return {
    availableYears,
    availableMonths,
    filteredSongs,
    getAvailableMonthsForYear,
  };
}
