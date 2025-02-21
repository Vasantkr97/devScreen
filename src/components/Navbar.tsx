import React from 'react'
import { ModeToggle } from './ModeToggle'
import Link from 'next/link'
import { CodeIcon } from 'lucide-react'
import { SignedIn, UserButton } from '@clerk/nextjs'
import DashboardBtn from './DashboardBtn'

const Navbar = () => {
  return (
    <nav className='border-b px-20 py-3'>
      <div className='flex'>
          {/* Left Side */}
          <Link 
            href='/'
            className='flex items-center gap-2 font-semibold text-2xl mr-6 font-mono hover:opacity-80 transition-opacity'
          >
            <CodeIcon className='size-8 text-white' />
            <span className='bg-gradient-to-r from-blue-500 font-bold to-blue-600 bg-clip-text text-transparent'>
              devScreen
            </span>
          </Link>
          {/* right Side */}
          <SignedIn>
            <div className='flex items-center space-x-4 ml-auto'>
              <DashboardBtn/ >
              <ModeToggle />
              <UserButton />
            </div>
          </SignedIn>
      </div>
    </nav>
  )
}

export default Navbar