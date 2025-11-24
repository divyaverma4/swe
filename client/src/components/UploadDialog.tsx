"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SquarePlus } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface UploadDialogProps {
  onUpload?: () => void | Promise<void>
}


const UploadDialog = ({ onUpload }: UploadDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const getCurrentDate = () => new Date().toISOString().split("T")[0]

  const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

  const extractErrorMessage = (e: unknown): string => {
    if (e instanceof Error) return e.message
    if (typeof e === "string") return e
    try {
      return JSON.stringify(e)
    } catch {
      return String(e)
    }
  }

  const extractBodyMessage = (body: unknown): string | null => {
    if (body == null) return null
    if (typeof body === "string") return body
    if (typeof body === "object") {
      try {
        const b = body as Record<string, unknown>
        if (typeof b.message === "string") return b.message
        if (typeof b.error === "string") return b.error
        return JSON.stringify(b)
      } catch {
        return String(body)
      }
    }
    return String(body)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/png", "image/jpeg"]
    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (!validTypes.includes(file.type) || (fileExtension && !["png", "jpeg", "jpg"].includes(fileExtension))) {
      setError("Please upload an image file (PNG or JPEG).")
      setFormData({ ...formData, image: null })
      return
    }

    if (file.size > MAX_BYTES) {
      setError("File is too large. Maximum size is 10 MB.")
      setFormData({ ...formData, image: null })
      return
    }

    setError("")
    setFormData({ ...formData, image: file })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    if (!formData.title.trim()) {
      setError("Artwork title is required.")
      return
    }
    if (!formData.image) {
      setError("Image file is required.")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error("Not authenticated")

      const fd = new FormData()
      fd.append("title", formData.title)
      fd.append("description", formData.description)
      // use key 'file' on the backend
      fd.append("file", formData.image)

      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001"}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      })

      if (!resp.ok) {
        // Try to read JSON, otherwise fall back to text for richer error messages
        let body: unknown = null
        try {
          body = await resp.json()
        } catch {
          try {
            body = await resp.text()
          } catch {
            body = null
          }
        }
        const serverMessage = extractBodyMessage(body) || `Upload failed (${resp.status})`
        const detailed = `Upload failed - status: ${resp.status} ${resp.statusText} - message: ${serverMessage}`
        console.error(detailed, { status: resp.status, statusText: resp.statusText, body })
        // surface a helpful message in the UI
        setError(detailed)
        return
      }

      setSuccess(true)
      setFormData({ title: "", description: "", image: null })
      setError("")
      // call optional callback so page can refresh the gallery
      if (onUpload) await onUpload()
    } catch (err: unknown) {
      console.error(err)
      setError(extractErrorMessage(err) || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-2 text-black">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <SquarePlus />
          </Button>
        </DialogTrigger>

  <DialogContent className="sm:max-w-[600px] w-full">
          <DialogHeader>
            <DialogTitle>Upload Artwork</DialogTitle>
            <DialogDescription>
              Upload images of your artwork here. Accepted formats: PNG, JPEG (max 10MB).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Label htmlFor="title" className="sm:w-1/4 w-full sm:text-right text-left">
                Artwork Title *
              </Label>
              <div className="sm:w-3/4 w-full">
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Label htmlFor="date" className="sm:w-1/4 w-full sm:text-right text-left">
                Date Uploaded
              </Label>
              <div className="sm:w-3/4 w-full">
                <Input id="date" type="text" value={getCurrentDate()} disabled className="bg-muted w-full" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Label htmlFor="image" className="sm:w-1/4 w-full sm:text-right text-left">
                Image File *
              </Label>
              <div className="sm:w-3/4 w-full">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="w-full"
                  aria-describedby="upload-help"
                />
              </div>
            </div>

            <div id="upload-help" className="w-full text-sm text-muted-foreground text-center sm:text-left sm:pl-4">
              Accepted formats: PNG, JPEG. Max size: 10MB.
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Label htmlFor="description" className="sm:w-1/4 w-full sm:text-right text-left pt-2">
                Description
              </Label>
              <div className="sm:w-3/4 w-full">
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full"
                />
              </div>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}
            {success && <div className="text-sm text-success">Upload successful.</div>}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>{loading ? "Uploading..." : "Upload Artwork"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UploadDialog
