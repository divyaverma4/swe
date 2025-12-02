"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { EditProfileModal } from "./EditProfile"

interface ProfileHeaderProps {
  name: string
  profileImage: string
  bio?: string
  userType?: string
  canEdit?: boolean
  profileId?: string
  onProfileUpdate?: (updatedProfile: any) => void
}

export function ProfileHeader({
  name,
  profileImage,
  bio,
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
    user_type: userType,
    avatar_url: profileImage,
  })

  // Sync state with props when they change
  useEffect(() => {
    setCurrentProfile(prev => ({
      ...prev,
      username: name,
      bio,
      user_type: userType,
      avatar_url: profileImage,
    }))
  }, [name, bio, userType, profileImage])

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
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border border-gray-300 dark:border-gray-600 bg-muted flex items-center justify-center">
              {currentProfile.avatar_url && currentProfile.avatar_url !== "/placeholder.svg" ? (
                <Image
                  src={currentProfile.avatar_url}
                  alt={currentProfile.username}
                  unoptimized
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
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

              {currentProfile.bio && (
                <p className="text-muted-foreground mb-4">{currentProfile.bio}</p>
              )}
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
