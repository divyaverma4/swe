"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark } from "lucide-react";
import { useSearchParams } from "next/navigation";

// TODO: FINALIZE/EDIT ARTWORK PARAMS
interface Artwork {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  image: string;
  height: string;
  liked: boolean;
  saved: boolean;
}

const mockArtworks: Artwork[] = [
  {
    id: "1",
    title: "Rainbow Spiral",
    artistName: "Sarah Chen",
    artistId: "sarah-chen",
    image: "/1.jpg",
    height: "h-96",
    liked: false,
    saved: false,
  },
  {
    id: "2",
    title: "Modern Art Piece",
    artistName: "Alex Rivera",
    artistId: "alex-rivera",
    image: "/2.jpg",
    height: "h-[500px]",
    liked: false,
    saved: false,
  },
  {
    id: "3",
    title: "Face",
    artistName: "Jordan Park",
    artistId: "jordan-park",
    image: "/3.jpg",
    height: "h-80",
    liked: false,
    saved: false,
  },
];

function ArtworkCard({
  artwork,
  onToggleLike,
  onToggleSave,
}: {
  artwork: Artwork;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
}) {
  return (
    <div className="w-full max-w-md mx-auto bg-muted rounded-xl overflow-hidden shadow-md">
      <Link href={`/artist/${artwork.artistId}`}>
        <div className="relative">
          <img
            src={artwork.image || "/placeholder.svg"}
            alt={artwork.title}
            className="w-full h-80 object-cover"
          />
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(artwork.id);
              }}
              className="p-2 rounded-full bg-white/90 text-foreground hover:bg-white shadow-lg"
            >
              <Bookmark className={`w-5 h-5 ${artwork.saved ? "fill-foreground" : ""}`} />
            </button>
          </div>
          <div className="absolute bottom-3 left-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleLike(artwork.id);
              }}
              className="p-2 rounded-full bg-white/90 text-foreground hover:bg-white shadow-lg"
            >
              <Heart className={`w-5 h-5 ${artwork.liked ? "fill-destructive text-destructive" : ""}`} />
            </button>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground">{artwork.title}</h3>
        <p className="text-sm text-muted-foreground">by {artwork.artistName}</p>
      </div>
    </div>
  );
}

const page = () => {
  const searchParams = useSearchParams();
  const loginType = searchParams.get("type"); // "user" or "creator"
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworks);

  const toggleLike = (id: string) => {
    setArtworks(artworks.map((art) => (art.id === id ? { ...art, liked: !art.liked } : art)));
  };

  const toggleSave = (id: string) => {
    setArtworks(artworks.map((art) => (art.id === id ? { ...art, saved: !art.saved } : art)));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">ARTichoke</h1>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search artwork..."
                className="px-4 py-2 rounded-full bg-muted text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                Explore
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">
          Congratulations! You have logged in successfully.
        </h1>
        {loginType && (
          <p className="text-lg">
            You are logged in as a <strong>{loginType}</strong>.
          </p>
        )}

        {/* Artwork Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default page;