import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadPlatformState, savePlatformState, resetPlatformState, PLATFORM_STORAGE_KEY } from '../utils/storage';

describe('SCHLAR JEE Storage and Session QA Suite', () => {
  beforeEach(() => {
    // Clear mock storage
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        for (const k in storage) delete storage[k];
      },
      get length() {
        return Object.keys(storage).length;
      },
      key: (i: number) => Object.keys(storage)[i] || null,
    });
  });

  it('1. Loads pristine initial demo baseline when storage is empty', () => {
    const state = loadPlatformState();
    expect(state.exams.length).toBeGreaterThan(0);
    expect(state.questions.length).toBeGreaterThan(0);
    expect(state.users.length).toBeGreaterThan(0);
    expect(state.activeRole).toBeNull();
  });

  it('2. Persists updated platform state and restores accurately', () => {
    const initial = loadPlatformState();
    const updatedExams = [
      ...initial.exams,
      {
        ...initial.exams[0],
        id: 'new-custom-exam-999',
        title: 'Institutional Custom Test',
      },
    ];

    savePlatformState({ exams: updatedExams, activeRole: 'examiner' });

    const restored = loadPlatformState();
    expect(restored.exams.some((e) => e.id === 'new-custom-exam-999')).toBe(true);
    expect(restored.activeRole).toBe('examiner');
  });

  it('3. Recovers gracefully from malformed or corrupted localStorage', () => {
    localStorage.setItem(PLATFORM_STORAGE_KEY, 'CORRUPTED_{INVALID_JSON_DATA');

    const recovered = loadPlatformState();
    expect(recovered.exams.length).toBeGreaterThan(0);
    expect(recovered.questions.length).toBeGreaterThan(0);
  });

  it('4. Resets platform state deliberately back to pristine baseline', () => {
    savePlatformState({
      exams: [],
      activeRole: 'student',
    });

    const resetState = resetPlatformState();
    expect(resetState.exams.length).toBeGreaterThan(0);
    expect(resetState.activeRole).toBeNull();
  });
});
