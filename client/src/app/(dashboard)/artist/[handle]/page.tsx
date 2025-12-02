"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ProfileHeader } from "@/components/ProfileHeader"
import { ArtworkGallery } from "@/components/Gallery"

type Artwork = {
  id: string
  title: string
  image_url: string
  image?: string
  tags?: string[]
}

type Profile = {
  id: string
  username?: string
  handle?: string
  bio?: string
  email?: string
  instagram?: string
  website?: string
  profile_image?: string
  avatar_url?: string
  user_type?: string
}

export default function Page() {
  const params = useParams() as { handle?: string }
  const router = useRouter()
  const handle = params.handle
  const isUuid = (s?: string) => !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const objectUrlsRef = useRef<string[]>([])

  useEffect(() => {
    if (!handle) return
    let mounted = true

    const mapArtworks = async (rows: Record<string, unknown>[]): Promise<Artwork[]> => {
      // Clean up old object URLs
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
      
      const mapped: Artwork[] = []
      
      for (const r of rows) {
        const art: Artwork = {
          id: String(r.id),
          title: String(r.title || ''),
          image_url: String(r.image_url || ''),
          tags: Array.isArray(r.tags) ? r.tags : []
        }
        
        // Try to download the image first (authenticated access)
        if (r.image_url) {
          try {
            const { data: file, error: fileError } = await supabase.storage
              .from("artworks")
              .download(String(r.image_url))
            
            if (!fileError && file) {
              const url = URL.createObjectURL(file)
              art.image = url
              objectUrlsRef.current.push(url)
            } else {
              // Fallback: try to get a signed URL from the server
              try {
                const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001"
                const resp = await fetch(
                  `${base}/signed-url?path=${encodeURIComponent(String(r.image_url))}`
                )
                if (resp.ok) {
                  const json = await resp.json()
                  art.image = json.signed_url || json.signedURL
                }
              } catch (err) {
                console.warn("Signed URL fallback failed for", r.image_url, err)
              }
            }
          } catch (err) {
            console.warn("Failed to load image for", r.image_url, err)
          }
        }
        
        mapped.push(art)
      }
      
      return mapped
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Try server-side resolver first
        try {
          const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001"
          const res = await fetch(`${base}/artist-resolver?handle=${encodeURIComponent(handle)}`)
          
          if (res.ok) {
            const json = await res.json()
            const prof = json?.profile as Profile | null
            const rows = json?.artworks || []

            if (prof) {
              if (mounted) {
                setProfile(prof)
                setArtworks(await mapArtworks(rows))
                console.log('Loaded profile via server resolver:', prof)
              }
              setLoading(false)
              return
            } else if (rows.length > 0) {
              if (mounted) {
                setArtworks(await mapArtworks(rows))
                setError('Profile not found — showing artworks')
              }
              setLoading(false)
              return
            }
          }
        } catch (e) {
          console.debug('Server resolver failed:', e)
        }
        // Fallback: Try multiple lookup strategies
        let prof: Profile | null = null

        // Try by handle
        const { data: byHandle } = await supabase
          .from('profiles')
          .select('*')
          .eq('handle', handle)
          .limit(1)
          .maybeSingle()
        if (byHandle) prof = byHandle

        // Redirect to canonical handle if different
        if (prof && prof.handle && prof.handle !== handle) {
          router.replace(`/artist/${prof.handle}`)
          return
        }

        // If no profile, try to fetch artworks directly
        if (!prof) {
          const lookupFields = ['handle', 'username', ...(isUuid(handle) ? ['user_id'] : [])]
          
          for (const field of lookupFields) {
            const { data: rows } = await supabase
              .from('artworks_with_username')
              .select('*')
              .eq(field, handle)
              .order('created_at', { ascending: false })
            
            if (rows && rows.length > 0) {
              if (mounted) {
                setArtworks(await mapArtworks(rows))
                setError('Profile not found — showing artworks')
              }
              setLoading(false)
              return
            }
          }

          setError("Profile not found")
          setLoading(false)
          return
        }

        if (mounted) setProfile(prof)

        // Fetch artworks for the profile
        const { data: rows, error: rowsError } = await supabase
          .from("artworks")
          .select("*")
          .eq("user_id", prof.id)
          .order("created_at", { ascending: false })

        if (rowsError) throw rowsError
        if (mounted) setArtworks(await mapArtworks(rows || []))
      } catch (err: unknown) {
        console.error(err)
        if (mounted) setError((err as Error)?.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { 
      mounted = false
      // Clean up object URLs on unmount
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [handle, router, supabase])

  if (!handle) return <div className="p-8">Invalid artist</div>
  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-destructive">{error}</div>
  if (!profile) return <div className="p-8">Profile not found</div>

  return (
    <main className="min-h-screen bg-background">
      <ProfileHeader
        name={profile.username || ""}
        profileImage={profile.avatar_url || profile.profile_image || "/placeholder.svg"}
        bio={profile.bio}
        email={profile.email}
        instagram={profile.instagram}
        website={profile.website}
        userType={profile.user_type}
        canEdit={false}
        profileId={profile.id}
      />

      <ArtworkGallery
        artworks={artworks.map((a) => ({ 
            id: a.id, 
            title: a.title, 
            image: a.image || "/placeholder.svg?height=400&width=400", 
            height: 400 
        }))}
      />
    </main>
  )
}
