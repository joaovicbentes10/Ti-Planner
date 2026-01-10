// Task Management Types for IT Task Planner

export type Priority = 'high' | 'medium' | 'low' | 'none';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  icon?: string;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  duration: number;
  completedAt: string;
  type: 'work' | 'short_break' | 'long_break';
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  pomodoro: PomodoroSettings;
  notifications: boolean;
}

export interface DailyStats {
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  pomodoroSessions: number;
  focusMinutes: number;
}

// Predefined tags for IT tasks
export const PREDEFINED_TAGS = [
  { id: 'bug', label: 'Bug', color: '#EF4444' },
  { id: 'feature', label: 'Feature', color: '#10B981' },
  { id: 'docs', label: 'Docs', color: '#3B82F6' },
  { id: 'deploy', label: 'Deploy', color: '#8B5CF6' },
  { id: 'meeting', label: 'Meeting', color: '#F59E0B' },
  { id: 'research', label: 'Research', color: '#EC4899' },
  { id: 'refactor', label: 'Refactor', color: '#06B6D4' },
  { id: 'test', label: 'Test', color: '#84CC16' },
] as const;

// Status configuration
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'A Fazer', color: '#6B7280' },
  in_progress: { label: 'Em Progresso', color: '#3B82F6' },
  review: { label: 'Revisão', color: '#F59E0B' },
  done: { label: 'Concluído', color: '#10B981' },
  blocked: { label: 'Bloqueado', color: '#EF4444' },
};

// Priority configuration
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: 'Alta', color: '#EF4444' },
  medium: { label: 'Média', color: '#F59E0B' },
  low: { label: 'Baixa', color: '#10B981' },
  none: { label: 'Nenhuma', color: '#6B7280' },
};

// Default project colors
export const PROJECT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
];

// Helper functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function createTask(partial: Partial<Task>): Task {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: '',
    priority: 'none',
    status: 'todo',
    tags: [],
    subtasks: [],
    comments: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function createProject(partial: Partial<Project>): Project {
  return {
    id: generateId(),
    name: '',
    color: PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)],
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function createSubtask(title: string): Subtask {
  return {
    id: generateId(),
    title,
    completed: false,
  };
}
