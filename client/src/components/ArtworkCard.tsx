"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Bookmark } from "lucide-react"

export type UIArtwork = {
    id: string
    title: string
    artistName: string
    artistHandle: string
    image: string
    height?: string
    liked?: boolean
    saved?: boolean
    tags?: string[] | null
    artistAvatar?: string | null
}

interface ArtworkCardProps {
    artwork: UIArtwork
    onToggleLike: (id: string) => void
    onToggleSave: (id: string) => void
}

export function ArtworkCard({
    artwork,
    onToggleLike,
    onToggleSave,
}: ArtworkCardProps) {
    return (
        <div className="w-full max-w-md mx-auto bg-muted rounded-xl overflow-hidden shadow-md">
            <Link href={`/artist/${artwork.artistHandle}`}>
                <div className="relative">
                    <Image
                        src={artwork.image || "/placeholder.svg"}
                        alt={artwork.title}
                        width={400}
                        height={320}
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
                                className={`w-5 h-5 ${artwork.liked ? "fill-destructive text-destructive" : ""
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </Link>
            <div className="p-4">
                <h3 className="font-bold text-lg text-foreground">{artwork.title}</h3>
                <div className="flex items-center gap-2">
                    <Link href={`/artist/${artwork.artistHandle}`} className="inline-block">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {artwork.artistAvatar ? (
                                <Image src={artwork.artistAvatar} alt={artwork.artistName} width={32} height={32} unoptimized className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-gray-600">{(artwork.artistName || "?").slice(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                    </Link>
                    <p className="text-sm text-muted-foreground">by {artwork.artistName}</p>
                </div>
                {artwork.tags && artwork.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {artwork.tags.map((t) => (
                            <span
                                key={t}
                                className="inline-block text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
