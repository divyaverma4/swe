import { ProfileHeader } from "@/components/ProfileHeader"
import { ArtworkGallery } from "@/components/Gallery"

// Mock data - replace with real data from db
const mockArtworks = [
  {
    id: "1",
    title: "Digital Dreams",
    image: "/abstract-digital-composition.png",
    height: 500,
  },
  {
    id: "2",
    title: "Ethereal Landscapes",
    image: "/landscape-artwork.jpg",
    height: 600,
  },
  {
    id: "3",
    title: "Color Studies",
    image: "/colorful-abstract.png",
    height: 400,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ProfileHeader
        name="Alex Morgan"
        profileImage="/artist-profile-picture.jpg"
        bio="Passionate artist exploring the intersection of color, form, and emotion through contemporary art. With over a decade of experience, I create pieces that challenge perception and invite viewers into immersive visual experiences."
        email="alex.morgan@example.com"
        instagram="@alexmorgan.art"
        website="alexmorgan.art"
      />
      <ArtworkGallery artworks={mockArtworks} />
    </main>
  )
}
