"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Song } from "@/types/song";

interface AddTrackDialogProps {
  onTrackAdded: (song: Song) => void;
}

export function AddTrackDialog({ onTrackAdded }: AddTrackDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    youtubeUrl: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add track");
      }

      const song: Song = await response.json();
      onTrackAdded(song);
      setFormData({ youtubeUrl: "", description: "" });
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 px-8 py-6 font-bold">
          <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
          Add Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-primary">
            Add to This Month&apos;s Playlist
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share a YouTube link with the community
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <label className="block mb-2 font-bold text-foreground">
              YouTube URL
            </label>
            <Input
              value={formData.youtubeUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
              }
              placeholder="https://youtube.com/watch?v=..."
              required
              className="bg-input-background border-2 border-border focus:border-primary"
            />
          </div>
          <div>
            <label className="block mb-2 font-bold text-foreground">
              Description (optional)
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Why this track?"
              rows={3}
              className="bg-input-background resize-none border-2 border-border focus:border-primary"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 shadow-lg shadow-primary/30"
          >
            {isSubmitting ? "Adding..." : "Add to Playlist"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
