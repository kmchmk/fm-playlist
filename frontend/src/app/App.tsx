import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar, Play } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

interface PlaylistEntry {
  id: string;
  youtubeUrl: string;
  videoId: string;
  userName: string;
  caption: string;
  month: string;
  addedAt: number;
}

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthDisplay = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function App() {
  const [entries, setEntries] = useState<PlaylistEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    userName: '',
    caption: ''
  });
  const [activeVideo, setActiveVideo] = useState<PlaylistEntry | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('playlist-entries');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('playlist-entries', JSON.stringify(entries));
    }
  }, [entries]);

  const availableMonths = Array.from(
    new Set(entries.map(e => e.month))
  ).sort().reverse();

  if (!availableMonths.includes(getCurrentMonth())) {
    availableMonths.unshift(getCurrentMonth());
  }

  const filteredEntries = entries
    .filter(e => e.month === selectedMonth)
    .sort((a, b) => b.addedAt - a.addedAt);

  useEffect(() => {
    if (filteredEntries.length > 0) {
      const currentActiveStillInList = filteredEntries.find(e => e.id === activeVideo?.id);
      if (!currentActiveStillInList) {
        setActiveVideo(filteredEntries[0]);
      }
    } else {
      setActiveVideo(null);
    }
  }, [selectedMonth, entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const videoId = extractYouTubeId(formData.youtubeUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    const newEntry: PlaylistEntry = {
      id: Date.now().toString(),
      youtubeUrl: formData.youtubeUrl,
      videoId,
      userName: formData.userName.trim() || 'Anonymous',
      caption: formData.caption,
      month: getCurrentMonth(),
      addedAt: Date.now()
    };

    setEntries(prev => [...prev, newEntry]);
    setFormData({ youtubeUrl: '', userName: '', caption: '' });
    setIsDialogOpen(false);
    setSelectedMonth(getCurrentMonth());
    setActiveVideo(newEntry);
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-6xl sm:text-8xl mb-4 font-black tracking-tight text-primary">
            FM Playlist
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Share your favorite tracks, discover what's moving the FM crew
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border border-border">
            <Calendar className="w-5 h-5 text-secondary" strokeWidth={2.5} />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-64 bg-transparent border-0 shadow-none font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {formatMonthDisplay(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 px-8 py-6 font-bold">
                <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
                Add Track
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border-2 border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-primary">
                  Add to This Month's Playlist
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Share a YouTube link with the community
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div>
                  <label className="block mb-2 font-bold text-foreground">YouTube URL</label>
                  <Input
                    value={formData.youtubeUrl}
                    onChange={e => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                    className="bg-input-background border-2 border-border focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-foreground">Your Name</label>
                  <Input
                    value={formData.userName}
                    onChange={e => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                    placeholder="Anonymous"
                    className="bg-input-background border-2 border-border focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-foreground">Caption (optional)</label>
                  <Textarea
                    value={formData.caption}
                    onChange={e => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Why this track?"
                    rows={3}
                    className="bg-input-background resize-none border-2 border-border focus:border-primary"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 shadow-lg shadow-primary/30">
                  Add to Playlist
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Playlist */}
        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h3 className="text-3xl font-black mb-3 text-foreground">No tracks yet</h3>
            <p className="text-lg text-muted-foreground mb-8 font-medium">
              Be the first to add a track to {formatMonthDisplay(selectedMonth)}
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 shadow-xl shadow-primary/30"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
              Add First Track
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Main Player */}
            {activeVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-primary/20"
              >
                <div className="relative aspect-video bg-black">
                  <iframe
                    key={activeVideo.id}
                    src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6 space-y-3">
                  <p className="font-bold text-foreground">{activeVideo.userName}</p>
                  {activeVideo.caption && (
                    <p className="text-lg text-foreground leading-relaxed font-medium">
                      "{activeVideo.caption}"
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground font-semibold">
                    Added {new Date(activeVideo.addedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Thumbnails Grid */}
            <div>
              <h3 className="text-xl font-black mb-4 text-foreground">All Tracks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry, index) => (
                    <motion.button
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setActiveVideo(entry)}
                      className={`group relative aspect-video bg-black rounded-xl overflow-hidden transition-all ${
                        activeVideo?.id === entry.id
                          ? 'ring-4 ring-primary shadow-xl shadow-primary/30'
                          : 'ring-2 ring-border hover:ring-primary/50 shadow-md'
                      }`}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${entry.videoId}/hqdefault.jpg`}
                        alt={`${entry.userName}'s track`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {activeVideo?.id !== entry.id && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" strokeWidth={0} />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/90">
                        <p className="text-xs font-bold text-white truncate">{entry.userName}</p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-base font-bold text-muted-foreground">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'track' : 'tracks'} in {formatMonthDisplay(selectedMonth)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
