export interface SafeUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface MemberWithRole extends SafeUser {
  isOwner: boolean;
  taskCount?: number;
  doneCount?: number;
}
