"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, SquarePlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import UploadDialog from "@/components/UploadDialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface Artwork {
  id: string;
  title: string;
  user_id: string;
  username?: string;
  image_url: string;
  image?: string;
  is_public?: boolean;
}

type UIArtwork = {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  image: string;
  height?: string;
  liked?: boolean;
  saved?: boolean;
};

const extractErrorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
};

function ArtworkCard({
  artwork,
  onToggleLike,
  onToggleSave,
}: {
  artwork: UIArtwork;
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
              <Bookmark
                className={`w-5 h-5 ${artwork.saved ? "fill-foreground" : ""}`}
              />
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
              <Heart
                className={`w-5 h-5 ${
                  artwork.liked ? "fill-destructive text-destructive" : ""
                }`}
              />
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

const Page = () => {
  const searchParams = useSearchParams();
  const loginType = searchParams.get("type"); // "user" or "creator"
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<
    Record<string, { liked: boolean; saved: boolean }>
  >({});
  const [isCreator, setIsCreator] = useState(false);

  const fetchArtworks = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        setError("You must be logged in to view artworks.");
        setLoading(false);
        return;
      }

      const userId = sessionData.session.user?.id;

      // Determine whether this user has Creator user_type so we can enable uploads
      try {
        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', userId)
          .single();
        if (!profError && prof && (prof as any).user_type === 'creator') {
          setIsCreator(true);
        } else {
          setIsCreator(false);
        }
      } catch (e) {
        console.warn('Failed to fetch profile user_type', e);
        setIsCreator(false);
      }

      const { data: rows, error: rowsError } = await supabase
        .from("artworks_with_username")
        .select("*")
        .order("created_at", { ascending: false });
      if (rowsError) throw rowsError;

      artworks.forEach((a) => {
        if (a.image) URL.revokeObjectURL(a.image);
      });

      const mapped: Artwork[] = [];
      for (const row of rows) {
        const art: Artwork = {
          id: row.id,
          title: row.title,
          user_id: row.user_id,
          username:
            row.username || (row.user_id === userId ? "You" : row.user_id),
          image_url: row.image_url,
          is_public: row.is_public,
        };

        try {
          const { data: file, error: fileError } = await supabase.storage
            .from("artworks")
            .download(row.image_url);
          if (!fileError && file) {
            const url = URL.createObjectURL(file);
            art.image = url;
          } else {
            // fallback: ask backend for a signed URL
            try {
              const resp = await fetch(
                `/signed-url?path=${encodeURIComponent(row.image_url)}`
              );
              if (resp.ok) {
                const json = await resp.json();
                art.image =
                  json.signed_url ||
                  json.signedURL ||
                  json?.signedURL ||
                  json?.signed_url;
              }
            } catch (err: unknown) {
              console.warn(
                "Signed URL fallback failed for",
                row.image_url,
                extractErrorMessage(err)
              );
            }
          }
        } catch (e: unknown) {
          console.warn(
            "Failed to download image for",
            row.image_url,
            extractErrorMessage(e)
          );
        }

        mapped.push(art);
      }

      setArtworks(mapped);
    } catch (e: unknown) {
      console.error(e);
      setError(extractErrorMessage(e) || "Failed to load artworks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
    return () => {
      // Revoke any object URLs on unmount
      artworks.forEach((a) => {
        if (a.image) URL.revokeObjectURL(a.image);
      });
    };
  }, []);

  const toggleLike = (id: string) => {
    setFlags((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { liked: false, saved: false }),
        liked: !(prev[id]?.liked || false),
      },
    }));
  };

  const toggleSave = (id: string) => {
    setFlags((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { liked: false, saved: false }),
        saved: !(prev[id]?.saved || false),
      },
    }));
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">ARTichoke</h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artwork or author..."
                className="px-4 py-2 rounded-full bg-muted text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {isCreator ? (
                <UploadDialog onUpload={fetchArtworks} />
              ) : (
                <span title="Only Creators can upload" className="inline-block">
                  <Button variant="outline" disabled className="text-foreground">
                    <SquarePlus />
                    Upload
                  </Button>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks
            .filter((a) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              const title = (a.title || "").toLowerCase();
              const username = (a.username || a.user_id || "").toLowerCase();
              return title.includes(q) || username.includes(q);
            })
            .map((artwork) => {
              const f = flags[artwork.id] || { liked: false, saved: false };
              const ui: UIArtwork = {
                id: artwork.id,
                title: artwork.title,
                artistName: artwork.username || artwork.user_id,
                artistId: artwork.user_id,
                image: artwork.image || "/placeholder.svg",
                height: "h-80",
                liked: f.liked,
                saved: f.saved,
              };
              return (
                <ArtworkCard
                  key={artwork.id}
                  artwork={ui}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                />
              );
            })}
        </div>
      </main>
    </div>
  );
};

export default Page;
