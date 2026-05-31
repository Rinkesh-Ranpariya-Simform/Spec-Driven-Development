import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h1 className='text-2xl font-bold text-white'>Create your account</h1>
        <p className='text-sm text-gray-400'>
          Start tracking your team&apos;s work today
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
