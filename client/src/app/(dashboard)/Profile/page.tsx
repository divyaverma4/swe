"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { ProfileHeader } from "@/components/ProfileHeader"
import { ArtworkGallery } from "@/components/Gallery"

type Artwork = {
  id: string
  title: string
  image_url: string
  image?: string
}

type Profile = {
  id: string
  username?: string
  bio?: string
  email?: string
  instagram?: string
  website?: string
  profile_image?: string
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
  const [artworks, setArtworks] = useState<Artwork[]>([])
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

        // Fetch user's artworks
        const { data: rows, error: rowsError } = await supabase
          .from("artworks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
        if (rowsError) throw rowsError

        const mapped: Artwork[] = []
        for (const r of rows || []) {
          const art: Artwork = {
            id: r.id,
            title: r.title,
            image_url: r.image_url,
          }
          try {
            const { data: file, error: fileError } = await supabase.storage.from("artworks").download(r.image_url)
            if (!fileError && file) {
              art.image = URL.createObjectURL(file)
            }
          } catch (err: unknown) {
            console.warn("Failed to download image for", r.image_url, extractErrorMessage(err))
          }
          mapped.push(art)
        }
        if (mounted) setArtworks(mapped)
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
      artworks.forEach((a) => {
        if (a.image) URL.revokeObjectURL(a.image)
      })
    }
  }, [])

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-destructive">{error}</div>

  return (
    <main className="min-h-screen bg-background">
      <ProfileHeader
        name={profile?.username || "Artist"}
        profileImage={profile?.profile_image || "/placeholder.svg"}
        bio={profile?.bio || ""}
        email={profile?.email || ""}
        instagram={profile?.instagram || ""}
        website={profile?.website || ""}
        userType={profile?.user_type || "user"}
        canEdit={isCurrentUser}
        profileId={currentUserId || ""}
        onProfileUpdate={handleProfileUpdate}
      />
      <ArtworkGallery
        artworks={artworks.map((a) => ({
          id: a.id,
          title: a.title,
          image: a.image || "/placeholder.svg?height=400&width=400",
          height: 400,
        }))}
      />
    </main>
  )
}

export default Page
