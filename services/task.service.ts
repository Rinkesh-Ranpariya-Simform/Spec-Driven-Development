import { connectDB } from '@/lib/db';
import { Task } from '@/models/Task';
import { assertMember } from './project.service';
import mongoose from 'mongoose';

export async function getTasksByProject(projectId: string, userId: string) {
  await assertMember(projectId, userId);
  await connectDB();
  const tasks = await Task.find({ projectId })
    .populate('assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 })
    .lean();
  return tasks.map(t => ({
    ...t,
    _id: t._id.toString(),
    projectId: t.projectId.toString(),
  }));
}

export async function createTask(
  userId: string,
  data: {
    title: string;
    description?: string;
    projectId: string;
    status?: string;
    priority?: string | null;
    assignedTo?: string | null;
    dueDate?: string | null;
  }
) {
  await assertMember(data.projectId, userId);
  await connectDB();

  const task = await Task.create({
    title: data.title,
    description: data.description || '',
    projectId: new mongoose.Types.ObjectId(data.projectId),
    status: data.status || 'todo',
    priority: data.priority || null,
    assignedTo: data.assignedTo
      ? new mongoose.Types.ObjectId(data.assignedTo)
      : null,
    createdBy: new mongoose.Types.ObjectId(userId),
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
  });

  return task;
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string | null;
    assignedTo?: string | null;
    dueDate?: string | null;
  }
) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw { status: 404, message: 'Task not found' };

  await assertMember(task.projectId.toString(), userId);

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.status !== undefined)
    task.status = data.status as typeof task.status;
  if (data.priority !== undefined)
    task.priority = data.priority as typeof task.priority;
  if (data.assignedTo !== undefined) {
    task.assignedTo = data.assignedTo
      ? new mongoose.Types.ObjectId(data.assignedTo)
      : undefined;
  }
  if (data.dueDate !== undefined) {
    task.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
  }

  await task.save();
  await task.populate('assignedTo', 'firstName lastName');
  return task;
}

export async function deleteTask(taskId: string, userId: string) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw { status: 404, message: 'Task not found' };

  await assertMember(task.projectId.toString(), userId);
  await Task.findByIdAndDelete(taskId);
}
