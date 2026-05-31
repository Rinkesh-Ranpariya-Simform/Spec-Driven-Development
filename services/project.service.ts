import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';
import { Task } from '@/models/Task';
import '@/models/User';
import mongoose from 'mongoose';

export async function assertMember(projectId: string, userId: string) {
  await connectDB();
  const project = await Project.findById(projectId);
  if (!project) {
    throw { status: 404, message: 'Project not found' };
  }
  const uid = new mongoose.Types.ObjectId(userId);
  const isMember =
    project.owner.equals(uid) ||
    project.members.some((m: mongoose.Types.ObjectId) => m.equals(uid));
  if (!isMember) {
    throw { status: 403, message: 'Access denied' };
  }
  return project;
}

function assertOwner(
  project: { owner: mongoose.Types.ObjectId },
  userId: string
) {
  if (!project.owner.equals(new mongoose.Types.ObjectId(userId))) {
    throw {
      status: 403,
      message: 'Only the project owner can perform this action',
    };
  }
}

export async function getProjectsByUser(userId: string) {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const projects = await Project.find({
    $or: [{ owner: uid }, { members: uid }],
  })
    .populate('owner', 'firstName lastName email')
    .populate('members', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  const projectIds = projects.map(p => p._id);
  const taskCounts = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    {
      $group: {
        _id: '$projectId',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
      },
    },
  ]);

  const countMap = new Map(taskCounts.map(tc => [tc._id.toString(), tc]));

  return projects.map(p => {
    const counts = countMap.get(p._id.toString());
    return {
      ...p,
      _id: p._id.toString(),
      taskCount: counts?.total ?? 0,
      completedTaskCount: counts?.completed ?? 0,
    };
  });
}

export async function getProjectById(projectId: string, userId: string) {
  const project = await assertMember(projectId, userId);
  await project.populate('owner', 'firstName lastName email');
  await project.populate('members', 'firstName lastName email');
  return project;
}

export async function createProject(
  userId: string,
  data: { name: string; description?: string; color?: string }
) {
  await connectDB();
  const project = await Project.create({
    name: data.name,
    description: data.description || '',
    color: data.color || '#6366f1',
    owner: new mongoose.Types.ObjectId(userId),
    members: [],
  });
  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: { name?: string; description?: string; color?: string }
) {
  const project = await assertMember(projectId, userId);
  assertOwner(project, userId);

  if (data.name !== undefined) project.name = data.name;
  if (data.description !== undefined) project.description = data.description;
  if (data.color !== undefined) project.color = data.color;

  await project.save();
  await project.populate('owner', 'firstName lastName email');
  await project.populate('members', 'firstName lastName email');
  return project;
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await assertMember(projectId, userId);
  assertOwner(project, userId);

  await Task.deleteMany({ projectId: project._id });
  await Project.findByIdAndDelete(projectId);
}

export async function getMembersWithOwner(projectId: string, userId: string) {
  const project = await assertMember(projectId, userId);
  await project.populate('owner', 'firstName lastName email');
  await project.populate('members', 'firstName lastName email');

  const ownerDoc = project.owner as unknown as {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    toObject?: () => Record<string, unknown>;
  };
  const membersArr = project.members as unknown as {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    toObject?: () => Record<string, unknown>;
  }[];

  const allUserIds = [ownerDoc._id, ...membersArr.map(m => m._id)];

  // Get task counts per member
  const taskCounts = await Task.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
        assignedTo: { $in: allUserIds },
      },
    },
    {
      $group: {
        _id: '$assignedTo',
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
      },
    },
  ]);

  const countMap = new Map(
    taskCounts.map(
      (t: { _id: mongoose.Types.ObjectId; total: number; done: number }) => [
        t._id.toString(),
        { taskCount: t.total, doneCount: t.done },
      ]
    )
  );

  return [
    {
      _id: ownerDoc._id.toString(),
      firstName: ownerDoc.firstName,
      lastName: ownerDoc.lastName,
      email: ownerDoc.email,
      isOwner: true,
      taskCount: countMap.get(ownerDoc._id.toString())?.taskCount ?? 0,
      doneCount: countMap.get(ownerDoc._id.toString())?.doneCount ?? 0,
    },
    ...membersArr.map(m => ({
      _id: m._id.toString(),
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      isOwner: false,
      taskCount: countMap.get(m._id.toString())?.taskCount ?? 0,
      doneCount: countMap.get(m._id.toString())?.doneCount ?? 0,
    })),
  ];
}

export async function addMember(
  projectId: string,
  ownerId: string,
  newUserId: string
) {
  const project = await assertMember(projectId, ownerId);
  assertOwner(project, ownerId);

  const uid = new mongoose.Types.ObjectId(newUserId);
  if (project.owner.equals(uid)) {
    throw { status: 400, message: 'User is already the project owner' };
  }
  if (project.members.some((m: mongoose.Types.ObjectId) => m.equals(uid))) {
    throw { status: 400, message: 'User is already a member' };
  }

  project.members.push(uid);
  await project.save();
  return getMembersWithOwner(projectId, ownerId);
}

export async function removeMember(
  projectId: string,
  ownerId: string,
  targetUserId: string
) {
  const project = await assertMember(projectId, ownerId);
  assertOwner(project, ownerId);

  const uid = new mongoose.Types.ObjectId(targetUserId);
  if (project.owner.equals(uid)) {
    throw { status: 400, message: 'Cannot remove the project owner' };
  }

  project.members = project.members.filter(
    (m: mongoose.Types.ObjectId) => !m.equals(uid)
  );
  await project.save();
  return getMembersWithOwner(projectId, ownerId);
}
