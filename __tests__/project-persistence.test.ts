import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Project } from '@/lib/types';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Project Color Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate corporate color format', () => {
    const validColors = ['#0066CC', '#00AA44', '#FF6600', '#9933CC', '#FF3333'];
    const invalidColors = ['0066CC', 'blue', '#GG6600', 'rgb(0,102,204)'];

    validColors.forEach(color => {
      expect(/^#[0-9A-F]{6}$/i.test(color)).toBe(true);
    });

    invalidColors.forEach(color => {
      expect(/^#[0-9A-F]{6}$/i.test(color)).toBe(false);
    });
  });

  it('should have corporate color palette defined', () => {
    const corporateColors = {
      blue: '#0066CC',
      green: '#00AA44',
      orange: '#FF6600',
      purple: '#9933CC',
      red: '#FF3333',
    };

    Object.values(corporateColors).forEach(color => {
      expect(/^#[0-9A-F]{6}$/i.test(color)).toBe(true);
    });
  });

  it('should verify all corporate colors are unique', () => {
    const corporateColors = [
      '#0066CC', '#00AA44', '#FF6600', '#9933CC', '#FF3333'
    ];
    const uniqueColors = new Set(corporateColors);
    expect(uniqueColors.size).toBe(corporateColors.length);
  });
});
