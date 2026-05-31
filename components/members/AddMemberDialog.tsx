'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMembers, useAddMember } from '@/hooks/useMembers';
import { Search, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

interface SearchUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  projectId,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const [adding, setAdding] = useState(false);
  const { data: members } = useMembers(projectId);
  const addMember = useAddMember(projectId);

  const fetchUsers = useCallback(
    async (q: string) => {
      setSearching(true);
      try {
        const url = q
          ? `/api/users/search?q=${encodeURIComponent(q)}`
          : `/api/users/search?q=`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          const memberIds = new Set(members?.map(m => m._id) ?? []);
          setResults(
            json.data.filter((u: SearchUser) => !memberIds.has(u._id))
          );
        }
      } finally {
        setSearching(false);
      }
    },
    [members]
  );

  // Fetch users when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      const res = await fetch('/api/users/search?q=');
      const json = await res.json();
      if (!cancelled && json.success) {
        const memberIds = new Set(members?.map(m => m._id) ?? []);
        setResults(json.data.filter((u: SearchUser) => !memberIds.has(u._id)));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, members]);

  // Load all users when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      fetchUsers('');
    } else {
      setQuery('');
      setResults([]);
      setSelected([]);
    }
    onOpenChange(newOpen);
  };

  const handleSearch = async (q: string) => {
    setQuery(q);
    fetchUsers(q);
  };

  const toggleSelect = (user: SearchUser) => {
    setSelected(prev =>
      prev.some(s => s._id === user._id)
        ? prev.filter(s => s._id !== user._id)
        : [...prev, user]
    );
  };

  const removeSelected = (userId: string) => {
    setSelected(prev => prev.filter(s => s._id !== userId));
  };

  const handleAddAll = async () => {
    setAdding(true);
    try {
      for (const user of selected) {
        await addMember.mutateAsync(user._id);
      }
      setSelected([]);
      setQuery('');
      setResults([]);
      onOpenChange(false);
    } finally {
      setAdding(false);
    }
  };

  const isSelected = (userId: string) => selected.some(s => s._id === userId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='bg-[#1a1a1a] border-white/10 text-white max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold'>
            Add Members
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {/* Selected chips */}
          {selected.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {selected.map(user => (
                <span
                  key={user._id}
                  className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-sm'
                >
                  <span className='w-5 h-5 rounded-full bg-purple-600/80 flex items-center justify-center text-[10px] font-medium'>
                    {user.firstName[0]}
                    {user.lastName?.[0] || ''}
                  </span>
                  <span className='text-white text-xs font-medium'>
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={() => removeSelected(user._id)}
                    className='text-gray-400 hover:text-white'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search input */}
          <div className='flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-3 py-2'>
            <Search className='h-4 w-4 text-gray-500' />
            <input
              type='text'
              placeholder='Search members...'
              value={query}
              onChange={e => handleSearch(e.target.value)}
              className='bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 w-full'
            />
          </div>

          {/* Results list */}
          {searching && (
            <p className='text-xs text-gray-500 px-1'>Searching...</p>
          )}
          <div className='max-h-60 overflow-y-auto'>
            {results.map(user => {
              const checked = isSelected(user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => toggleSelect(user)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                    checked ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-gray-300'>
                      {user.firstName[0]}
                      {user.lastName?.[0] || ''}
                    </div>
                    <span className='text-sm text-white font-medium'>
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  {checked && <Check className='h-4 w-4 text-white' />}
                </button>
              );
            })}
            {!searching && results.length === 0 && (
              <p className='text-xs text-gray-500 text-center py-4'>
                No users found
              </p>
            )}
          </div>

          {/* Footer buttons */}
          <div className='flex items-center justify-end gap-3 pt-2'>
            <Button
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='text-gray-300 hover:text-white'
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAll}
              disabled={selected.length === 0 || adding}
              className='bg-white text-black hover:bg-gray-200 disabled:opacity-50'
            >
              {adding ? 'Adding...' : `Add (${selected.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
