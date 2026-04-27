"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import type { Song } from "@/types/song";
import { getCurrentMonth, getCurrentYear } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MonthYearFilter } from "./MonthYearFilter";
import { SearchBar } from "./SearchBar";
import { VideoPlayer } from "./VideoPlayer";
import { ThumbnailGrid } from "./ThumbnailGrid";
import { AddTrackDialog } from "./AddTrackDialog";

interface PlaylistViewProps {
  initialSongs: Song[];
  user?: {
    name?: string;
    picture?: string;
    email?: string;
  } | null;
}

export function PlaylistView({ initialSongs, user }: PlaylistViewProps) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentMonth());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<Song | null>(null);

  // Apply search filter globally first
  const searchMatchedSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const query = searchQuery.toLowerCase();
    return songs.filter(
      (s) =>
        s.submitterName.toLowerCase().includes(query) ||
        (s.songTitle && s.songTitle.toLowerCase().includes(query)) ||
        (s.artistName && s.artistName.toLowerCase().includes(query)) ||
        (s.description && s.description.toLowerCase().includes(query))
    );
  }, [songs, searchQuery]);

  // Derive available years and months from search-matched data
  const availableYears = useMemo(() => {
    const years = new Set(searchMatchedSongs.map((s) => s.year));
    if (!searchQuery.trim()) years.add(getCurrentYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [searchMatchedSongs, searchQuery]);

  const availableMonths = useMemo(() => {
    const months = new Set(
      searchMatchedSongs.filter((s) => s.year === selectedYear).map((s) => s.month)
    );
    // Always include current month if viewing current year and not searching
    if (!searchQuery.trim() && selectedYear === getCurrentYear()) {
      months.add(getCurrentMonth());
    }
    return Array.from(months).sort((a, b) => a - b);
  }, [searchMatchedSongs, selectedYear, searchQuery]);

  // Filter by selected year/month within search results
  const filteredSongs = useMemo(() => {
    return searchMatchedSongs.filter(
      (s) => s.year === selectedYear && s.month === selectedMonth
    );
  }, [searchMatchedSongs, selectedYear, selectedMonth]);

  // Auto-adjust selected year/month when search narrows the available options
  useEffect(() => {
    if (!availableYears.includes(selectedYear) && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (!availableMonths.includes(selectedMonth) && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  // Auto-select first video when filter changes
  const currentActive = useMemo(() => {
    if (activeVideo && filteredSongs.find((s) => s.id === activeVideo.id)) {
      return activeVideo;
    }
    return filteredSongs[0] || null;
  }, [filteredSongs, activeVideo]);

  const handleYearChange = useCallback(
    (year: number) => {
      setSelectedYear(year);
      // Reset to first available month for that year
      const monthsInYear = searchMatchedSongs
        .filter((s) => s.year === year)
        .map((s) => s.month);
      if (!searchQuery.trim() && year === getCurrentYear()) {
        setSelectedMonth(getCurrentMonth());
      } else if (monthsInYear.length > 0) {
        setSelectedMonth(Math.max(...monthsInYear));
      }
      setActiveVideo(null);
    },
    [searchMatchedSongs, searchQuery]
  );

  const handleTrackAdded = useCallback((song: Song) => {
    setSongs((prev) => [song, ...prev]);
    setSelectedYear(song.year);
    setSelectedMonth(song.month);
    setActiveVideo(song);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Header user={user} />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
            <MonthYearFilter
              availableYears={availableYears}
              availableMonths={availableMonths}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={handleYearChange}
              onMonthChange={setSelectedMonth}
            />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {user && (
            <div className="w-full lg:w-auto">
              <AddTrackDialog onTrackAdded={handleTrackAdded} />
            </div>
          )}
        </motion.div>

        {/* Playlist */}
        {filteredSongs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h3 className="text-3xl font-black mb-3 text-foreground">
              {searchQuery ? "No matching tracks" : "No tracks yet"}
            </h3>
            <p className="text-lg text-muted-foreground mb-8 font-medium">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to add a track this month"}
            </p>
            {!searchQuery && user && (
              <AddTrackDialog onTrackAdded={handleTrackAdded} />
            )}
          </motion.div>
        ) : (
          <div className="space-y-8">
            {currentActive && <VideoPlayer song={currentActive} />}
            <ThumbnailGrid
              songs={filteredSongs}
              activeVideoId={currentActive?.id || null}
              onSelect={setActiveVideo}
            />
          </div>
        )}

        <Footer
          trackCount={filteredSongs.length}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </div>
  );
}
