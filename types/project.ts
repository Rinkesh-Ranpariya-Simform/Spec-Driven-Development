import { SafeUser } from './user';

export interface ProjectWithCounts {
  _id: string;
  name: string;
  description: string;
  color: string;
  owner: SafeUser;
  members: SafeUser[];
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
}
