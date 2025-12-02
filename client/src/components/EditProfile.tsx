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
    avatar_url?: string
  }
  onClose: () => void
  onSave: (updatedProfile: any) => void
}

export function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const supabase = createClient()
  const [formData, setFormData] = useState(profile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = e.target.files[0]
      console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type)

      // Get user token for authentication
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error("Not authenticated")

      // Upload via server endpoint to bypass RLS
      const fd = new FormData()
      fd.append("file", file)

      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001"}/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      })

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ message: "Upload failed" }))
        throw new Error(errorData.message || `Upload failed with status ${resp.status}`)
      }

      const result = await resp.json()
      console.log("Upload successful:", result)

      setFormData((prev) => ({ ...prev, avatar_url: result.avatar_url }))
      console.log("Avatar URL set to:", result.avatar_url)
    } catch (error) {
      console.error("Image upload error:", error)
      setError(error instanceof Error ? error.message : "Error uploading image")
    } finally {
      setUploading(false)
    }
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
          avatar_url: formData.avatar_url,
        })
        .eq("id", profile.id)

      if (updateError) throw updateError

      onSave(formData)
      onClose()
    } catch (e: any) {
      console.error("Save error:", e)
      setError(e?.message || e?.error_description || (e instanceof Error ? e.message : "Failed to save profile"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-4">Edit Profile</h2>

        <div className="space-y-4 mb-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Profile Image</label>
            <div className="flex items-center gap-4">
              {formData.avatar_url && (
                <img
                  src={formData.avatar_url}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-full object-cover border border-border"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
              />
            </div>
            {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
          </div>

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
        </div>

        {error && <div className="text-destructive text-sm mb-4">{error}</div>}

        <div className="flex gap-3 justify-end text-black">
          <Button variant="outline" onClick={onClose} disabled={loading || uploading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || uploading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
