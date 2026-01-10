import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from './types';

/**
 * Migração v2.6.1 - Adicionar campo comments às tarefas existentes
 */
export async function migrateTasksToV2_6_1(): Promise<void> {
  try {
    const tasksJson = await AsyncStorage.getItem('tasks');
    if (!tasksJson) return;

    const tasks: Task[] = JSON.parse(tasksJson);
    let needsMigration = false;

    const migratedTasks = tasks.map((task) => {
      // Se a tarefa não tem o campo comments, adicionar como array vazio
      if (!task.comments) {
        needsMigration = true;
        return {
          ...task,
          comments: [],
        };
      }
      return task;
    });

    // Salvar apenas se houver tarefas que precisam de migração
    if (needsMigration) {
      await AsyncStorage.setItem('tasks', JSON.stringify(migratedTasks));
      console.log(`[Migration] Migrated ${tasks.length} tasks to v2.6.1`);
    }
  } catch (error) {
    console.error('[Migration] Failed to migrate tasks:', error);
  }
}

/**
 * Executar todas as migrações necessárias
 */
export async function runMigrations(): Promise<void> {
  await migrateTasksToV2_6_1();
}
