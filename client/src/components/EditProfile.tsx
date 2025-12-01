"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EditProfileModalProps {
  profile: {
    id: string
    username?: string
    bio?: string
    email?: string
    instagram?: string
    website?: string
    profile_image?: string
  }
  onClose: () => void
  onSave: (updatedProfile: any) => void
}

export function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const supabase = createClient()
  const [formData, setFormData] = useState(profile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          bio: formData.bio,
          email: formData.email,
          instagram: formData.instagram,
          website: formData.website,
        })
        .eq("id", profile.id)

      if (updateError) throw updateError

      onSave(formData)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Edit Profile</h2>

        <div className="space-y-4 mb-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Username</label>
            <Input
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Instagram Handle</label>
            <Input
              name="instagram"
              value={formData.instagram || ""}
              onChange={handleChange}
              placeholder="@yourhandle"
              className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Website</label>
            <Input
              name="website"
              value={formData.website || ""}
              onChange={handleChange}
              placeholder="yourwebsite.com"
              className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
            />
          </div>
        </div>

        {error && <div className="text-destructive text-sm mb-4">{error}</div>}

        <div className="flex gap-3 justify-end text-black">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
