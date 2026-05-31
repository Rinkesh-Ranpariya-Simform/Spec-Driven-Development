import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Project } from '@/models/Project';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Providers } from '@/components/Providers';
import mongoose from 'mongoose';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let userName = 'User';
  let userEmail = '';
  let recentProjects: { _id: string; name: string }[] = [];

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      try {
        await connectDB();
        const user = await User.findById(payload.userId)
          .select('firstName lastName email')
          .lean();
        if (user) {
          userName = `${user.firstName} ${user.lastName}`;
          userEmail = user.email;
        }
        const uid = new mongoose.Types.ObjectId(payload.userId);
        const projects = await Project.find({
          $or: [{ owner: uid }, { members: uid }],
        })
          .select('name')
          .sort({ updatedAt: -1 })
          .limit(3)
          .lean();
        recentProjects = projects.map(p => ({
          _id: p._id.toString(),
          name: p.name,
        }));
      } catch {
        // ignore db errors for layout
      }
    }
  }

  return (
    <Providers>
      <div className='dark h-screen bg-[#0a0a0a] text-white overflow-hidden'>
        <Sidebar recentProjects={recentProjects} />
        <div className='ml-[240px] flex flex-col h-screen'>
          <Header userName={userName} userEmail={userEmail} />
          <main className='flex-1 p-6 flex flex-col min-h-0'>{children}</main>
        </div>
      </div>
    </Providers>
  );
}
