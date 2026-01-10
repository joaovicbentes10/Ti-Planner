// Recurring task types and utilities

export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurringTask {
  id: string;
  baseTaskId: string;
  pattern: RecurrencePattern;
  startDate: string;
  endDate?: string;
  daysOfWeek?: number[]; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  createdAt: string;
}

export function getNextOccurrence(recurring: RecurringTask, fromDate: Date = new Date()): Date | null {
  const startDate = new Date(recurring.startDate);
  
  if (fromDate < startDate) {
    return startDate;
  }

  if (recurring.endDate && fromDate > new Date(recurring.endDate)) {
    return null;
  }

  const next = new Date(fromDate);

  switch (recurring.pattern) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    
    case 'weekly':
      if (recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const nextDays = recurring.daysOfWeek.filter(d => d > currentDay);
        
        if (nextDays.length > 0) {
          next.setDate(next.getDate() + (nextDays[0] - currentDay));
        } else {
          // Move to next week
          const firstDayNextWeek = recurring.daysOfWeek[0];
          const daysUntilFirstDay = (7 - currentDay) + firstDayNextWeek;
          next.setDate(next.getDate() + daysUntilFirstDay);
        }
      } else {
        next.setDate(next.getDate() + 7);
      }
      break;
    
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    
    case 'monthly':
      if (recurring.dayOfMonth) {
        next.setMonth(next.getMonth() + 1);
        next.setDate(Math.min(recurring.dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      } else {
        next.setMonth(next.getMonth() + 1);
      }
      break;
    
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  if (recurring.endDate && next > new Date(recurring.endDate)) {
    return null;
  }

  return next;
}

export function generateRecurringTaskInstances(
  recurring: RecurringTask,
  baseTask: any,
  fromDate: Date = new Date(),
  toDate: Date = new Date(fromDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
): any[] {
  const instances = [];
  let currentDate = getNextOccurrence(recurring, fromDate);

  while (currentDate && currentDate <= toDate) {
    instances.push({
      ...baseTask,
      id: `${baseTask.id}_${currentDate.toISOString().split('T')[0]}`,
      dueDate: currentDate.toISOString(),
      recurringTaskId: recurring.id,
    });

    currentDate = getNextOccurrence(recurring, new Date(currentDate.getTime() + 1000));
  }

  return instances;
}
