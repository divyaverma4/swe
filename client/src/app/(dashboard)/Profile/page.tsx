"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { ProfileHeader } from "@/components/ProfileHeader"
import { ArtworkCard, type UIArtwork } from "@/components/ArtworkCard"

type Artwork = {
  id: string
  title: string
  image_url: string
  image?: string
  user_id: string
  username?: string
  handle?: string | null
  tags?: string[] | null
  avatar_url?: string | null
}

type Profile = {
  id: string
  username?: string
  bio?: string
  avatar_url?: string
  user_type?: string
}

const extractErrorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message
  if (typeof e === "string") return e
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}

const Page = () => {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [uploadedArtworks, setUploadedArtworks] = useState<Artwork[]>([])
  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([])
  const [savedArtworks, setSavedArtworks] = useState<Artwork[]>([])
  const [likedArtworkIds, setLikedArtworkIds] = useState<Set<string>>(new Set())
  const [savedArtworkIds, setSavedArtworkIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const userId = sessionData?.session?.user?.id
        if (!userId) {
          setError("Not logged in")
          setLoading(false)
          return
        }

        setCurrentUserId(userId)
        setIsCurrentUser(true)

        // Fetch profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle()
        if (mounted) setProfile(prof || { id: userId, username: "User", user_type: "user" })

        // Fetch user's uploaded artworks
        const { data: uploadedRows } = await supabase
          .from("artworks")
          .select("*, profiles(username, handle, avatar_url)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        const uploadedMapped: Artwork[] = []
        for (const r of (uploadedRows as any) || []) {
          const art: Artwork = {
            id: r.id,
            title: r.title,
            image_url: r.image_url,
            user_id: r.user_id,
            username: r.profiles?.username || "Unknown",
            handle: r.profiles?.handle,
            tags: r.tags,
            avatar_url: r.profiles?.avatar_url,
          }
          try {
            const { data: file } = await supabase.storage.from("artworks").download(r.image_url)
            if (file) {
              art.image = URL.createObjectURL(file)
            }
          } catch (err) {
            console.warn("Failed to download image for", r.image_url)
          }
          uploadedMapped.push(art)
        }
        if (mounted) setUploadedArtworks(uploadedMapped)

        // Fetch user's liked artworks
        const { data: likedRows } = await supabase
          .from("likes")
          .select("artwork_id, artworks(*, profiles(username, handle, avatar_url))")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        const likedMapped: Artwork[] = []
        const likedIds: string[] = []
        for (const r of (likedRows as any) || []) {
          const artwork = r.artworks
          if (!artwork) continue
          likedIds.push(artwork.id)

          const art: Artwork = {
            id: artwork.id,
            title: artwork.title,
            image_url: artwork.image_url,
            user_id: artwork.user_id,
            username: artwork.profiles?.username || "Unknown",
            handle: artwork.profiles?.handle,
            tags: artwork.tags,
            avatar_url: artwork.profiles?.avatar_url,
          }
          try {
            const { data: file } = await supabase.storage.from("artworks").download(artwork.image_url)
            if (file) {
              art.image = URL.createObjectURL(file)
            }
          } catch (err) {
            console.warn("Failed to download image for", artwork.image_url)
          }
          likedMapped.push(art)
        }
        if (mounted) {
          setLikedArtworks(likedMapped)
          setLikedArtworkIds(new Set(likedIds))
        }

        // Fetch user's saved artworks
        const { data: savedRows } = await supabase
          .from("saves")
          .select("artwork_id, artworks(*, profiles(username, handle, avatar_url))")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        const savedMapped: Artwork[] = []
        const savedIds: string[] = []
        for (const r of (savedRows as any) || []) {
          const artwork = r.artworks
          if (!artwork) continue
          savedIds.push(artwork.id)

          const art: Artwork = {
            id: artwork.id,
            title: artwork.title,
            image_url: artwork.image_url,
            user_id: artwork.user_id,
            username: artwork.profiles?.username || "Unknown",
            handle: artwork.profiles?.handle,
            tags: artwork.tags,
            avatar_url: artwork.profiles?.avatar_url,
          }
          try {
            const { data: file } = await supabase.storage.from("artworks").download(artwork.image_url)
            if (file) {
              art.image = URL.createObjectURL(file)
            }
          } catch (err) {
            console.warn("Failed to download image for", artwork.image_url)
          }
          savedMapped.push(art)
        }
        if (mounted) {
          setSavedArtworks(savedMapped)
          setSavedArtworkIds(new Set(savedIds))
        }
      } catch (e: unknown) {
        console.error(e)
        if (mounted) setError(extractErrorMessage(e) || "Failed to load profile")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
      // Cleanup object URLs
      uploadedArtworks.forEach((a) => { if (a.image) URL.revokeObjectURL(a.image) })
      likedArtworks.forEach((a) => { if (a.image) URL.revokeObjectURL(a.image) })
      savedArtworks.forEach((a) => { if (a.image) URL.revokeObjectURL(a.image) })
    }
  }, [])

  const handleProfileUpdate = async (updatedProfile: Profile) => {
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .maybeSingle()
      if (prof) {
        setProfile(prof)
      } else {
        setProfile(updatedProfile)
      }
    } catch (e) {
      console.error("Failed to refetch profile:", e)
      setProfile(updatedProfile)
    }
  }

  const toggleLike = async (id: string) => {
    if (!currentUserId) return
    const isLiked = likedArtworkIds.has(id)

    // Optimistic update
    setLikedArtworkIds(prev => {
      const newSet = new Set(prev)
      isLiked ? newSet.delete(id) : newSet.add(id)
      return newSet
    })

    try {
      if (isLiked) {
        await supabase.from("likes").delete().match({ user_id: currentUserId, artwork_id: id })
        setLikedArtworks(prev => prev.filter(a => a.id !== id))
      } else {
        await supabase.from("likes").insert({ user_id: currentUserId, artwork_id: id })
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      // Revert
      setLikedArtworkIds(prev => {
        const newSet = new Set(prev)
        isLiked ? newSet.add(id) : newSet.delete(id)
        return newSet
      })
    }
  }

  const toggleSave = async (id: string) => {
    if (!currentUserId) return
    const isSaved = savedArtworkIds.has(id)

    // Optimistic update
    setSavedArtworkIds(prev => {
      const newSet = new Set(prev)
      isSaved ? newSet.delete(id) : newSet.add(id)
      return newSet
    })

    try {
      if (isSaved) {
        await supabase.from("saves").delete().match({ user_id: currentUserId, artwork_id: id })
        setSavedArtworks(prev => prev.filter(a => a.id !== id))
      } else {
        await supabase.from("saves").insert({ user_id: currentUserId, artwork_id: id })
      }
    } catch (error) {
      console.error("Error toggling save:", error)
      // Revert
      setSavedArtworkIds(prev => {
        const newSet = new Set(prev)
        isSaved ? newSet.add(id) : newSet.delete(id)
        return newSet
      })
    }
  }

  const toUIArtwork = (art: Artwork): UIArtwork => ({
    id: art.id,
    title: art.title,
    artistName: art.username || art.user_id,
    artistHandle: art.handle || art.user_id,
    image: art.image || "/placeholder.svg",
    liked: likedArtworkIds.has(art.id),
    saved: savedArtworkIds.has(art.id),
    tags: art.tags,
    artistAvatar: art.avatar_url,
  })

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-destructive">{error}</div>

  return (
    <main className="min-h-screen bg-background">
      <ProfileHeader
        name={profile?.username || "Artist"}
        profileImage={profile?.avatar_url || "/placeholder.svg"}
        bio={profile?.bio || ""}
        userType={profile?.user_type || "user"}
        canEdit={isCurrentUser}
        profileId={currentUserId || ""}
        onProfileUpdate={handleProfileUpdate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Artwork */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">My Artwork</h2>
          {uploadedArtworks.length === 0 ? (
            <p className="text-muted-foreground">No uploaded artwork yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {uploadedArtworks.map(art => (
                <ArtworkCard
                  key={art.id}
                  artwork={toUIArtwork(art)}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </section>

        {/* Liked Artwork */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Liked Artwork</h2>
          {likedArtworks.length === 0 ? (
            <p className="text-muted-foreground">No liked artwork yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedArtworks.map(art => (
                <ArtworkCard
                  key={art.id}
                  artwork={toUIArtwork(art)}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </section>

        {/* Saved Artwork */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Saved Artwork</h2>
          {savedArtworks.length === 0 ? (
            <p className="text-muted-foreground">No saved artwork yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedArtworks.map(art => (
                <ArtworkCard
                  key={art.id}
                  artwork={toUIArtwork(art)}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Page
