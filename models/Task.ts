import mongoose, { Schema, Document } from 'mongoose';

export const TASK_STATUSES = [
  'backlog',
  'todo',
  'inprogress',
  'inreview',
  'done',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  projectId: mongoose.Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority | null;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'todo',
      required: true,
    },
    priority: { type: String, enum: TASK_PRIORITIES, default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

TaskSchema.index({ projectId: 1 });
TaskSchema.index({ projectId: 1, status: 1 });

export const Task =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
