import Image from "next/image"

interface Artwork {
  id: string
  title: string
  image: string
  height: number
}

interface ArtworkGalleryProps {
  artworks: Artwork[]
}

export function ArtworkGallery({ artworks }: ArtworkGalleryProps) {
  return (
    <div className="w-full bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="break-inside-avoid mb-6 group">
              <div className="relative overflow-hidden rounded-lg bg-card">
                <Image
                  src={artwork.image || "/placeholder.svg"}
                  alt={artwork.title}
                  width={400}
                  height={artwork.height}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{artwork.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
