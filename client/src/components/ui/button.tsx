import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline"
}

export const Button: React.FC<ButtonProps> = ({ size = "md", variant = "default", className = "", children, ...props }) => {
  let base = "rounded-md font-medium transition-colors"

  if (size === "sm") base += " px-3 py-1 text-sm"
  if (size === "md") base += " px-4 py-2 text-base"
  if (size === "lg") base += " px-6 py-3 text-lg"

  if (variant === "default") base += " bg-primary text-white hover:bg-primary/90"
  if (variant === "outline") base += " border border-gray-300 hover:bg-gray-100"

  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  )
}
