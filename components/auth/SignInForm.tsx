'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const SignInForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@taskflow.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Invalid credentials');
        return;
      }
      router.replace('/projects');
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-sm font-semibold text-white'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='demo@taskflow.com'
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
              placeholder='••••••••'
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
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <p className='text-center text-sm text-gray-400'>
        Don&apos;t have an account?{' '}
        <Link
          href='/sign-up'
          className='text-white font-medium hover:underline'
        >
          Sign up
        </Link>
      </p>

      <p className='text-center text-xs text-gray-500'>
        Demo: <span className='text-gray-400'>demo@taskflow.com</span> /{' '}
        <span className='text-gray-400'>password123</span>
      </p>
    </form>
  );
};
