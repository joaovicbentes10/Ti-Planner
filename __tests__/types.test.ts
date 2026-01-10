import { describe, it, expect } from 'vitest';
import { 
  generateId, 
  createTask, 
  createProject, 
  createSubtask,
  PREDEFINED_TAGS,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  PROJECT_COLORS,
} from '../lib/types';

describe('Types and Helpers', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('createTask', () => {
    it('should create a task with default values', () => {
      const task = createTask({});
      expect(task.id).toBeDefined();
      expect(task.title).toBe('');
      expect(task.priority).toBe('none');
      expect(task.status).toBe('todo');
      expect(task.tags).toEqual([]);
      expect(task.subtasks).toEqual([]);
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should create a task with provided values', () => {
      const task = createTask({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        status: 'in_progress',
        tags: ['Bug', 'Feature'],
      });
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('in_progress');
      expect(task.tags).toEqual(['Bug', 'Feature']);
    });
  });

  describe('createProject', () => {
    it('should create a project with default values', () => {
      const project = createProject({});
      expect(project.id).toBeDefined();
      expect(project.name).toBe('');
      expect(project.color).toBeDefined();
      expect(PROJECT_COLORS).toContain(project.color);
      expect(project.createdAt).toBeDefined();
    });

    it('should create a project with provided values', () => {
      const project = createProject({
        name: 'Test Project',
        description: 'Test Description',
        color: '#FF0000',
      });
      expect(project.name).toBe('Test Project');
      expect(project.description).toBe('Test Description');
      expect(project.color).toBe('#FF0000');
    });
  });

  describe('createSubtask', () => {
    it('should create a subtask with correct values', () => {
      const subtask = createSubtask('Test Subtask');
      expect(subtask.id).toBeDefined();
      expect(subtask.title).toBe('Test Subtask');
      expect(subtask.completed).toBe(false);
    });
  });

  describe('Constants', () => {
    it('should have predefined tags', () => {
      expect(PREDEFINED_TAGS.length).toBeGreaterThan(0);
      expect(PREDEFINED_TAGS.find(t => t.label === 'Bug')).toBeDefined();
      expect(PREDEFINED_TAGS.find(t => t.label === 'Feature')).toBeDefined();
    });

    it('should have status config for all statuses', () => {
      expect(STATUS_CONFIG.todo).toBeDefined();
      expect(STATUS_CONFIG.in_progress).toBeDefined();
      expect(STATUS_CONFIG.review).toBeDefined();
      expect(STATUS_CONFIG.done).toBeDefined();
      expect(STATUS_CONFIG.blocked).toBeDefined();
    });

    it('should have priority config for all priorities', () => {
      expect(PRIORITY_CONFIG.high).toBeDefined();
      expect(PRIORITY_CONFIG.medium).toBeDefined();
      expect(PRIORITY_CONFIG.low).toBeDefined();
      expect(PRIORITY_CONFIG.none).toBeDefined();
    });

    it('should have project colors', () => {
      expect(PROJECT_COLORS.length).toBeGreaterThan(0);
      PROJECT_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
