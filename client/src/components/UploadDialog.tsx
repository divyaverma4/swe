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

const UploadDialog = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
  })
  const [error, setError] = useState("")

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0]
  }



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["application/pdf", "image/png", "image/jpeg"]
      const validExtensions = ["pdf", "png", "jpeg", "jpg"]
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || "")) {
        setError("Please upload a PDF, PNG, JPEG, or JPG file.")
        return
      }
      setError("")
      setFormData({ ...formData, image: file })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError("Artwork title is required.")
      return
    }
    if (!formData.image) {
      setError("Image file is required.")
      return
    }
    console.log("Form submitted:", {
      ...formData,
      dateUploaded: getCurrentDate()
    })
    // Reset form after submission
    setFormData({ title: "", description: "", image: null })
    setError("")
  }

  return (
    <div className="p-2 text-black">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <SquarePlus />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Artwork</DialogTitle>
            <DialogDescription>
              Upload images of your artwork here. Fill in all required fields and click submit when you're done.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Artwork Title *
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter title"
                value={formData.title}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date Uploaded
              </Label>
              <Input id="date" type="text" value={getCurrentDate()} disabled className="col-span-3 bg-muted" />
            </div>


            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image File *
              </Label>
              <Input
                id="image"
                type="file"
                accept=".pdf,.png,.jpeg,.jpg"
                onChange={handleFileChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3 min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit">Upload Artwork</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UploadDialog
