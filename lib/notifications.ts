import * as Notifications from 'expo-notifications';
import { Task } from './types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Check for overdue and due-today tasks and send notifications
 */
export async function checkAndNotifyOverdueTasks(tasks: Task[]): Promise<void> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    const dueDate = task.dueDate.split('T')[0];
    return dueDate < today;
  });

  // Get tasks due today
  const dueTodayTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    const dueDate = task.dueDate.split('T')[0];
    return dueDate === today;
  });

  // Send notifications
  if (overdueTasks.length > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Tarefas Atrasadas',
        body: `Você tem ${overdueTasks.length} tarefa(s) atrasada(s). Vamos colocar em dia?`,
        data: { type: 'overdue', count: overdueTasks.length },
      },
      trigger: null, // Send immediately
    });
  }

  if (dueTodayTasks.length > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Tarefas para Hoje',
        body: `${dueTodayTasks.length} tarefa(s) vence(m) hoje. Vamos começar?`,
        data: { type: 'due_today', count: dueTodayTasks.length },
      },
      trigger: null, // Send immediately
    });
  }
}

/**
 * Schedule daily notification check at a specific time
 */
export async function scheduleDailyNotificationCheck(hour: number = 9, minute: number = 0): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Verificar Tarefas',
      body: 'Hora de revisar suas tarefas do dia',
      data: { type: 'daily_check' },
    },
    trigger: {
      type: 'calendar',
      hour,
      minute,
      repeats: true,
    } as any,
  });

  return notificationId;
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}
