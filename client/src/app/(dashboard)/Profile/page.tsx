"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type Artwork = {
  id: string;
  title: string;
  image_url: string;
  image?: string;
};

const extractErrorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}

const Page = () => {
  const supabase = createClient();
  const [profile, setProfile] = useState<{ id: string; username?: string } | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (!userId) {
          setError("Not logged in")
          setLoading(false)
          return
        }

        // Fetch profile
        const { data: prof } = await supabase.from('profiles').select('id, username').eq('id', userId).single();
        if (mounted) setProfile(prof || { id: userId });

        // Fetch user's artworks
        const { data: rows, error: rowsError } = await supabase.from('artworks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (rowsError) throw rowsError;

        const mapped: Artwork[] = [];
        for (const r of rows || []) {
          const art: Artwork = { id: r.id, title: r.title, image_url: r.image_url };
          try {
            const { data: file, error: fileError } = await supabase.storage.from('artworks').download(r.image_url);
            if (!fileError && file) {
              art.image = URL.createObjectURL(file);
            }
          } catch (err: unknown) {
            console.warn('Failed to download image for', r.image_url, extractErrorMessage(err));
          }
          mapped.push(art);
        }
        if (mounted) setArtworks(mapped);
      } catch (e: unknown) {
        console.error(e);
        if (mounted) setError(extractErrorMessage(e) || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      artworks.forEach((a) => { if (a.image) URL.revokeObjectURL(a.image) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-xl font-bold text-foreground">
          {profile?.username ? profile.username[0].toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile?.username || 'User'}</h1>
          <p className="text-sm text-muted-foreground">ID: {profile?.id}</p>
        </div>
        <div className="ml-auto">
          <Link href="/home" className="text-sm text-primary underline">Back to Home</Link>
        </div>
      </header>

      {loading && <div>Loading…</div>}
      {error && <div className="text-destructive">{error}</div>}

      <section>
        <h2 className="text-lg font-semibold mb-4">Your Artworks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artworks.length === 0 && !loading && (
            <div className="text-sm text-muted-foreground">You have not uploaded any artworks yet.</div>
          )}

          {artworks.map((a) => (
            <div key={a.id} className="bg-muted rounded-md overflow-hidden shadow">
              <img src={a.image || '/placeholder.svg'} alt={a.title} className="w-full h-48 object-cover" />
              <div className="p-3">
                <div className="font-semibold">{a.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Page;