"use client"

import React from 'react'
import { 
  Home, 
  User
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavBar = () => {
  const pathname = usePathname();
  
  // Helper function to dynamically set class names
  const getLinkClass = (path: string) => {
    // Case-insensitive check if the current path starts with the link's path
    const current = (pathname || '').toLowerCase();
    const p = path.toLowerCase();
    const isActive = current.startsWith(p);

    return `flex items-center rounded-2xl p-4 cursor-pointer hover:bg-gray-300 ${isActive ? "bg-gray-300" : ""}`;
  };

  return (
    <div className="fixed left-0 top-0 w-24 h-screen border-r-2 border-gray-200 text-black flex flex-col justify-between items-center p-4 z-50 bg-background">
      <ul className='space-y-4'>
        <li>
          <Link href="/home" className={getLinkClass("/home")}>
            <Home size={30} strokeWidth={2} />
          </Link>
        </li>
        <li>
          <Link href="/profile" className={getLinkClass("/profile")}>
            <User size={30} strokeWidth={2} />
          </Link>
        </li>
      </ul>
      <ul>
        <li>
          <Link href="/login" className={getLinkClass("/login")}>
            Log out
          </Link>
        </li>
      </ul>

    </div>
  )
}

export default NavBar