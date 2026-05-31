export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'inprogress'
  | 'inreview'
  | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskWithAssignee {
  _id: string;
  title: string;
  description: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdBy: string;
  dueDate: string | null;
  createdAt: string;
}
