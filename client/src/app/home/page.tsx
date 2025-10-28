"use client"   // <- add this at the very top

import React from "react"
import { useSearchParams } from "next/navigation"

const page = () => {
  const searchParams = useSearchParams()
  const loginType = searchParams.get("type") // "user" or "creator"

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">
        Congratulations! You have logged in successfully.
      </h1>
      {loginType && (
        <p className="text-lg text-muted-foreground">
          You are logged in as a <strong>{loginType}</strong>.
        </p>
      )}
    </div>
  )
}

export default page
