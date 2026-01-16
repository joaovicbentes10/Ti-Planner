import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Task, Project, AppSettings, DailyStats } from './types';
import * as store from './store';
import { runMigrations } from './migrations';

interface AppState {
  tasks: Task[];
  projects: Project[];
  settings: AppSettings;
  dailyStats: DailyStats[];
  isLoading: boolean;
  selectedProjectId: string | null;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_DAILY_STATS'; payload: DailyStats }
  | { type: 'SET_SELECTED_PROJECT'; payload: string | null };

const initialState: AppState = {
  tasks: [],
  projects: [],
  settings: {
    theme: 'system',
    notifications: true,
  },
  dailyStats: [],
  isLoading: true,
  selectedProjectId: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        tasks: state.tasks.map(t => t.projectId === action.payload ? { ...t, projectId: undefined } : t),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_DAILY_STATS':
      const existingIndex = state.dailyStats.findIndex(s => s.date === action.payload.date);
      if (existingIndex >= 0) {
        const newStats = [...state.dailyStats];
        newStats[existingIndex] = action.payload;
        return { ...state, dailyStats: newStats };
      }
      return { ...state, dailyStats: [action.payload, ...state.dailyStats] };
    case 'SET_SELECTED_PROJECT':
      return { ...state, selectedProjectId: action.payload };
    default:
      return state;
  }
}

interface TaskContextValue extends AppState {
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;
  addProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setSelectedProject: (projectId: string | null) => void;
  refreshData: () => Promise<void>;
  getTasksByProject: (projectId: string | null) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  clearAllData: () => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Run migrations before loading data
      await runMigrations();
      
      const [tasks, projects, settings, dailyStats] = await Promise.all([
        store.getTasks(),
        store.getProjects(),
        store.getSettings(),
        store.getDailyStats(),
      ]);
      dispatch({
        type: 'LOAD_DATA',
        payload: { tasks, projects, settings, dailyStats },
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check for overdue tasks and send notifications
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const { checkAndNotifyOverdueTasks } = await import('./notifications');
        await checkAndNotifyOverdueTasks(state.tasks);
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    checkNotifications(); // Check immediately on load

    return () => clearInterval(interval);
  }, [state.tasks]);

  const addTask = useCallback(async (taskData: Partial<Task>): Promise<Task> => {
    const newTask = await store.addTask(taskData);
    dispatch({ type: 'ADD_TASK', payload: newTask });
    await store.updateDailyStats({ tasksCreated: 1 });
    return newTask;
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const updated = await store.updateTask(taskId, updates);
    if (updated) {
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      if (updates.status === 'done') {
        await store.updateDailyStats({ tasksCompleted: 1 });
      }
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    const success = await store.deleteTask(taskId);
    if (success) {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    }
  }, []);

  const toggleTask = useCallback(async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(taskId, { status: newStatus });
  }, [state.tasks, updateTask]);

  const addProject = useCallback(async (projectData: Partial<Project>): Promise<Project> => {
    const newProject = await store.addProject(projectData);
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    return newProject;
  }, []);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    const updated = await store.updateProject(projectId, updates);
    if (updated) {
      dispatch({ type: 'UPDATE_PROJECT', payload: updated });
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    const success = await store.deleteProject(projectId);
    if (success) {
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...state.settings, ...updates };
    await store.saveSettings(newSettings);
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
  }, []);

  const setSelectedProject = useCallback((projectId: string | null) => {
    dispatch({ type: 'SET_SELECTED_PROJECT', payload: projectId });
  }, []);

  const getTasksByProject = useCallback((projectId: string | null): Task[] => {
    if (!projectId) return state.tasks;
    return state.tasks.filter(t => t.projectId === projectId);
  }, [state.tasks]);

  const getTasksByStatus = useCallback((status: Task['status']): Task[] => {
    return state.tasks.filter(t => t.status === status);
  }, [state.tasks]);

  const getTodayTasks = useCallback((): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return state.tasks.filter(t => {
      if (!t.dueDate) return false;
      return t.dueDate.split('T')[0] === today;
    });
  }, [state.tasks]);

  const getOverdueTasks = useCallback((): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return state.tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      return t.dueDate.split('T')[0] < today;
    });
  }, [state.tasks]);

  const clearAllData = useCallback(async () => {
    await store.clearAllData();
    dispatch({ type: 'LOAD_DATA', payload: initialState });
  }, []);

  const addComment = useCallback(async (taskId: string, text: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newComment = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      text,
      createdAt: new Date().toISOString(),
    };
    
    const updatedTask = {
      ...task,
      comments: [...task.comments, newComment],
      updatedAt: new Date().toISOString(),
    };
    
    await store.updateTask(taskId, updatedTask);
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  }, [state.tasks]);

  const value: TaskContextValue = {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addComment,
    addProject,
    updateProject,
    deleteProject,
    updateSettings,
    setSelectedProject,
    refreshData: loadData,
    getTasksByProject,
    getTasksByStatus,
    getTodayTasks,
    getOverdueTasks,
    clearAllData,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
