'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Member {
  _id: string;
  firstName: string;
  lastName?: string;
}

interface AssigneePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  members: Member[] | undefined;
}

export const AssigneePicker: React.FC<AssigneePickerProps> = ({
  value,
  onChange,
  members,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selected =
    value && value !== 'unassigned'
      ? members?.find(m => m._id === value)
      : null;

  const filtered = members?.filter(m => {
    if (!search) return true;
    const name = `${m.firstName} ${m.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div ref={containerRef} className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full h-8 rounded-md bg-[#141414] border border-white/10 text-white text-sm px-3 cursor-pointer'
      >
        {selected ? (
          <span className='flex items-center gap-2'>
            <span className='w-5 h-5 rounded-full bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[9px] font-medium text-white shrink-0'>
              {selected.firstName[0]}
              {selected.lastName?.[0] || ''}
            </span>
            <span className='truncate'>
              {selected.firstName} {selected.lastName}
            </span>
          </span>
        ) : (
          <span className='text-gray-400'>Unassigned</span>
        )}
        <ChevronDown className='h-4 w-4 text-gray-400 shrink-0' />
      </button>

      {isOpen && (
        <div className='absolute z-[100] top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden'>
          <div className='flex items-center gap-2 px-3 py-2 border-b border-white/10'>
            <Search className='h-3.5 w-3.5 text-gray-500' />
            <input
              ref={inputRef}
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search...'
              className='bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 w-full'
            />
          </div>
          <div className='max-h-40 overflow-y-auto py-1'>
            <button
              type='button'
              onClick={() => {
                onChange('unassigned');
                setIsOpen(false);
                setSearch('');
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
                !value || value === 'unassigned'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Unassigned
            </button>
            {filtered?.map(m => (
              <button
                type='button'
                key={m._id}
                onClick={() => {
                  onChange(m._id);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
                  value === m._id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className='w-5 h-5 rounded-full bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[9px] font-medium text-white shrink-0'>
                  {m.firstName[0]}
                  {m.lastName?.[0] || ''}
                </span>
                {m.firstName} {m.lastName}
              </button>
            ))}
            {filtered?.length === 0 && (
              <p className='text-xs text-gray-500 text-center py-2'>
                No members found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
