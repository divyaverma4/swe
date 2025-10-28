"use client"

import React from 'react'
import { 
  Home, 
  Compass, 
  User, 
  Settings 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavBar = () => {
  const pathname = usePathname();
  
  // Helper function to dynamically set class names
  const getLinkClass = (path: string) => {
    // Check if the current path starts with the link's path
    const isActive = pathname.startsWith(path);
    
    return `flex items-center rounded-2xl p-4 cursor-pointer hover:bg-gray-300 ${ // Base styles
      isActive
        ? "bg-gray-300" // <-- Active style
        : "" // <-- Inactive hover style
    }`;
  };

  return (
    <div className="w-24 h-screen border-r-2 border-gray-200 text-black flex flex-col justify-between items-center p-4">
      <ul className='space-y-4'>
        <li>
          <Link href="/home" className={getLinkClass("/home")}>
            <Home size={30} strokeWidth={2} />
          </Link>
        </li>
        <li>
          <Link href="/explore" className={getLinkClass("/explore")}>
            <Compass size={30} strokeWidth={2} />
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
          <Link href="/settings" className={getLinkClass("/settings")}>
            <Settings size={30} strokeWidth={2} />
          </Link>
        </li>
      </ul>

    </div>
  )
}

export default NavBar