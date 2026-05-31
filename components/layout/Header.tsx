'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'User',
  userEmail = '',
}) => {
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/sign-in';
  };

  return (
    <header className='h-14 border-b border-white/5 flex items-center justify-end px-6 bg-[#0a0a0a]'>
      {/* Right section */}
      <div className='flex items-center gap-3'>
        <DropdownMenu>
          <DropdownMenuTrigger className='flex items-center gap-2 outline-none cursor-pointer'>
            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white'>
              {initials}
            </div>
            <span className='text-sm font-medium text-white'>{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='bg-[#1a1a1a] border-white/10 w-56'
          >
            <div className='px-3 py-2.5 flex items-center gap-3'>
              <div className='w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0'>
                {initials}
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-medium text-white truncate'>
                  {userName}
                </p>
                <p className='text-xs text-gray-400 truncate'>{userEmail}</p>
              </div>
            </div>
            <Separator className='bg-white/10' />
            <DropdownMenuItem
              onClick={handleLogout}
              className='text-gray-300 hover:text-white cursor-pointer px-3 py-2'
            >
              <LogOut className='h-4 w-4 mr-2' />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
