import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (token) {
    const payload = verifyToken(token);
    if (payload) redirect('/projects');
  }

  return (
    <div className='dark min-h-screen flex items-center justify-center bg-[#0a0a0a]'>
      <div className='w-full max-w-md px-4'>{children}</div>
    </div>
  );
}
