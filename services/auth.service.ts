import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function registerUser({
  firstName,
  lastName,
  email,
  password,
}: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}) {
  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw { status: 400, message: 'Email already in use' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    firstName,
    lastName: lastName || '',
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}
