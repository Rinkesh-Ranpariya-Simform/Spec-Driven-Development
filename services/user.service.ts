import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function searchUsers(query: string, limit = 10) {
  await connectDB();
  const filter = query
    ? {
        $or: [
          { firstName: new RegExp(query, 'i') },
          { lastName: new RegExp(query, 'i') },
          { email: new RegExp(query, 'i') },
        ],
      }
    : {};
  const users = await User.find(filter)
    .select('firstName lastName email')
    .limit(limit)
    .lean();

  return users.map(u => ({ ...u, _id: u._id.toString() }));
}
