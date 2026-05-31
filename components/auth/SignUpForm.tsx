'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Registration failed');
        return;
      }
      router.replace('/sign-in');
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <Label
              htmlFor='firstName'
              className='text-sm font-semibold text-white'
            >
              First Name
            </Label>
            <Input
              id='firstName'
              placeholder='Alex'
              className='bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500'
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className='text-xs text-red-400'>{errors.firstName.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label
              htmlFor='lastName'
              className='text-sm font-semibold text-white'
            >
              Last Name
            </Label>
            <Input
              id='lastName'
              placeholder='Johnson'
              className='bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500'
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className='text-xs text-red-400'>{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email' className='text-sm font-semibold text-white'>
            Work Email
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='alex@taskflow.com'
            className='bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500'
            {...register('email')}
          />
          {errors.email && (
            <p className='text-xs text-red-400'>{errors.email.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label
            htmlFor='password'
            className='text-sm font-semibold text-white'
          >
            Password
          </Label>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='At least 8 characters'
              className='bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 pr-10'
              {...register('password')}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white'
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
          {errors.password && (
            <p className='text-xs text-red-400'>{errors.password.message}</p>
          )}
        </div>

        {error && <p className='text-sm text-red-400 text-center'>{error}</p>}

        <Button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-white text-black hover:bg-gray-200 font-medium'
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </div>

      <p className='text-center text-sm text-gray-400'>
        Already have an account?{' '}
        <Link
          href='/sign-in'
          className='text-white font-medium hover:underline'
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};
