"use client"

import Image from "next/image"
import { useState } from "react"
import { EditProfileModal } from "./EditProfile"

interface ProfileHeaderProps {
  name: string
  profileImage: string
  bio?: string
  email?: string
  instagram?: string
  website?: string
  userType?: string
  canEdit?: boolean
  profileId?: string
  onProfileUpdate?: (updatedProfile: any) => void
}

export function ProfileHeader({
  name,
  profileImage,
  bio = "Creator.",
  email = "example@example.com",
  instagram = "@example",
  website = "www.example.com",
  userType = "user",
  canEdit = false,
  profileId,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentProfile, setCurrentProfile] = useState({
    id: profileId || "",
    username: name,
    bio,
    email,
    instagram,
    website,
    user_type: userType,
  })

  const handleProfileUpdate = (updatedProfile: any) => {
    setCurrentProfile(updatedProfile)
    onProfileUpdate?.(updatedProfile)
  }

  return (
    <>
      <div className="w-full bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
            {/* Profile Image */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border border-gray-300 dark:border-gray-600">
              <Image
                src={profileImage || "/placeholder.svg"}
                alt={currentProfile.username}
                fill
                className="object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold text-foreground">{currentProfile.username}</h1>
                {/* Role badge */}
                <span className="px-2 py-1 text-xs font-semibold rounded-md bg-muted text-muted-foreground">
                  {(currentProfile as any).user_type === "creator" ? "Creator" : "User"}
                </span>
                {canEdit && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="px-3 py-1 text-sm border border-border text-foreground rounded hover:bg-muted transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              <p className="text-muted-foreground mb-4">{currentProfile.bio}</p>

              {/* Contact / Links */}
              <div className="flex flex-wrap gap-4">
                <a
                  href={`mailto:${currentProfile.email}`}
                  className="px-4 py-2 bg-accent text-background rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Contact Artist
                </a>

                {currentProfile.instagram && (
                  <a
                    href={`https://instagram.com/${currentProfile.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                  >
                    {currentProfile.instagram}
                  </a>
                )}

                {currentProfile.website && (
                  <a
                    href={`https://${currentProfile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                  >
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <EditProfileModal
          profile={currentProfile}
          onClose={() => setIsEditOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </>
  )
}
