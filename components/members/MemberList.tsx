'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { useMembers, useRemoveMember } from '@/hooks/useMembers';
import { Button } from '@/components/ui/button';

interface MemberListProps {
  projectId: string;
  isOwner: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({
  projectId,
  isOwner,
}) => {
  const { data: members, isLoading } = useMembers(projectId);
  const removeMember = useRemoveMember(projectId);

  if (isLoading) {
    return (
      <div className='animate-pulse space-y-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='h-14 bg-white/5 rounded-lg' />
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <p className='text-sm text-gray-500 text-center py-8'>
        No members added yet
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {members
        .filter(member => !member.isOwner)
        .map(member => (
          <div
            key={member._id}
            className='flex items-center justify-between py-3'
          >
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-gray-300'>
                {member.firstName[0]}
                {member.lastName?.[0] || ''}
              </div>
              <div>
                <p className='text-sm font-medium text-white'>
                  {member.firstName} {member.lastName}
                </p>
                <p className='text-xs text-gray-400'>{member.email}</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='text-right'>
                <p className='text-sm text-red-400 font-medium'>
                  {member.taskCount ?? 0} tasks
                </p>
                <p className='text-xs text-gray-500'>
                  {member.doneCount ?? 0} done
                </p>
              </div>
              {isOwner && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-400/10'
                  onClick={() => removeMember.mutate(member._id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
        ))}
      {members.filter(m => !m.isOwner).length === 0 && (
        <p className='text-sm text-gray-500 text-center py-8'>
          No members added yet
        </p>
      )}
    </div>
  );
};
