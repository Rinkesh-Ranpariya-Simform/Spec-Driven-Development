import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h1 className='text-2xl font-bold text-white'>Welcome back</h1>
        <p className='text-sm text-gray-400'>
          Sign in to your TaskFlow account
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
