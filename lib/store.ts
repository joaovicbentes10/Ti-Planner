import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Project, PomodoroSession, AppSettings, DailyStats, createTask, createProject } from './types';

const STORAGE_KEYS = {
  TASKS: '@it_task_planner/tasks',
  PROJECTS: '@it_task_planner/projects',
  POMODORO_SESSIONS: '@it_task_planner/pomodoro_sessions',
  SETTINGS: '@it_task_planner/settings',
  DAILY_STATS: '@it_task_planner/daily_stats',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  pomodoro: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  },
  notifications: true,
};

// Generic storage helpers
async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  return getItem<Task[]>(STORAGE_KEYS.TASKS, []);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await setItem(STORAGE_KEYS.TASKS, tasks);
}

export async function addTask(taskData: Partial<Task>): Promise<Task> {
  const tasks = await getTasks();
  const newTask = createTask(taskData);
  tasks.unshift(newTask);
  await saveTasks(tasks);
  return newTask;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return null;
  
  const updatedTask = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  if (updates.status === 'done' && tasks[index].status !== 'done') {
    updatedTask.completedAt = new Date().toISOString();
  }
  
  tasks[index] = updatedTask;
  await saveTasks(tasks);
  return updatedTask;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  if (filtered.length === tasks.length) return false;
  await saveTasks(filtered);
  return true;
}

export async function toggleTaskStatus(taskId: string): Promise<Task | null> {
  const tasks = await getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  
  const newStatus = task.status === 'done' ? 'todo' : 'done';
  return updateTask(taskId, { status: newStatus });
}

// Projects
export async function getProjects(): Promise<Project[]> {
  return getItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await setItem(STORAGE_KEYS.PROJECTS, projects);
}

export async function addProject(projectData: Partial<Project>): Promise<Project> {
  const projects = await getProjects();
  const newProject = createProject(projectData);
  projects.unshift(newProject);
  await saveProjects(projects);
  return newProject;
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index === -1) return null;
  
  projects[index] = { ...projects[index], ...updates };
  await saveProjects(projects);
  return projects[index];
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  if (filtered.length === projects.length) return false;
  await saveProjects(filtered);
  
  // Also remove project reference from tasks
  const tasks = await getTasks();
  const updatedTasks = tasks.map(t => 
    t.projectId === projectId ? { ...t, projectId: undefined } : t
  );
  await saveTasks(updatedTasks);
  
  return true;
}

// Pomodoro Sessions
export async function getPomodoroSessions(): Promise<PomodoroSession[]> {
  return getItem<PomodoroSession[]>(STORAGE_KEYS.POMODORO_SESSIONS, []);
}

export async function addPomodoroSession(session: Omit<PomodoroSession, 'id' | 'completedAt'>): Promise<PomodoroSession> {
  const sessions = await getPomodoroSessions();
  const newSession: PomodoroSession = {
    ...session,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    completedAt: new Date().toISOString(),
  };
  sessions.unshift(newSession);
  await setItem(STORAGE_KEYS.POMODORO_SESSIONS, sessions);
  return newSession;
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Daily Stats
export async function getDailyStats(): Promise<DailyStats[]> {
  return getItem<DailyStats[]>(STORAGE_KEYS.DAILY_STATS, []);
}

export async function updateDailyStats(updates: Partial<Omit<DailyStats, 'date'>>): Promise<DailyStats> {
  const stats = await getDailyStats();
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = stats.findIndex(s => s.date === today);
  
  const todayStats: DailyStats = todayIndex >= 0 
    ? stats[todayIndex]
    : { date: today, tasksCreated: 0, tasksCompleted: 0, pomodoroSessions: 0, focusMinutes: 0 };
  
  const updatedStats: DailyStats = {
    ...todayStats,
    tasksCreated: todayStats.tasksCreated + (updates.tasksCreated || 0),
    tasksCompleted: todayStats.tasksCompleted + (updates.tasksCompleted || 0),
    pomodoroSessions: todayStats.pomodoroSessions + (updates.pomodoroSessions || 0),
    focusMinutes: todayStats.focusMinutes + (updates.focusMinutes || 0),
  };
  
  if (todayIndex >= 0) {
    stats[todayIndex] = updatedStats;
  } else {
    stats.unshift(updatedStats);
  }
  
  // Keep only last 90 days
  const trimmed = stats.slice(0, 90);
  await setItem(STORAGE_KEYS.DAILY_STATS, trimmed);
  
  return updatedStats;
}

// Export/Import
export async function exportAllData(): Promise<string> {
  const [tasks, projects, sessions, settings, stats] = await Promise.all([
    getTasks(),
    getProjects(),
    getPomodoroSessions(),
    getSettings(),
    getDailyStats(),
  ]);
  
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    projects,
    pomodoroSessions: sessions,
    settings,
    dailyStats: stats,
  }, null, 2);
}

export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.version || !data.tasks) {
      throw new Error('Invalid data format');
    }
    
    await Promise.all([
      saveTasks(data.tasks || []),
      saveProjects(data.projects || []),
      setItem(STORAGE_KEYS.POMODORO_SESSIONS, data.pomodoroSessions || []),
      saveSettings(data.settings || DEFAULT_SETTINGS),
      setItem(STORAGE_KEYS.DAILY_STATS, data.dailyStats || []),
    ]);
    
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}
