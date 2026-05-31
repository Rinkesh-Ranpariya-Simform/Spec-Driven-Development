'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProject {
  _id: string;
  name: string;
}

interface SidebarProps {
  recentProjects?: SidebarProject[];
}

export const Sidebar: React.FC<SidebarProps> = ({ recentProjects = [] }) => {
  const pathname = usePathname();

  return (
    <aside className='w-[240px] h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col fixed left-0 top-0 z-30'>
      {/* Logo */}
      <div className='p-4 border-b border-white/5'>
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white'>
            TF
          </div>
          <span className='text-sm font-semibold text-white'>Task Flow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-3 space-y-1'>
        <p className='text-[11px] font-medium text-gray-500 uppercase tracking-wider px-3 mb-2'>
          Menu
        </p>
        <Link
          href='/projects'
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            pathname.startsWith('/projects')
              ? 'bg-indigo-600/20 text-indigo-400 font-medium'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          <FolderKanban className='h-4 w-4' />
          Projects
        </Link>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className='mt-6'>
            <p className='text-[11px] font-medium text-gray-500 uppercase tracking-wider px-3 mb-2'>
              Recent Projects
            </p>
            {recentProjects.map(project => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  pathname === `/projects/${project._id}`
                    ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <FolderKanban className='h-3.5 w-3.5' />
                {project.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
};
