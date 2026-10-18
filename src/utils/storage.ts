import {
  Exam,
  Question,
  DemoUser,
  ExamResult,
  ScheduleItem,
  ActivityLog,
  QuestionPaperDraft,
  PlatformSettings,
  UserRole,
} from '../types';
import {
  INITIAL_EXAMS,
  INITIAL_QUESTIONS,
  INITIAL_USERS,
  INITIAL_RESULTS,
  INITIAL_SCHEDULES,
  INITIAL_ACTIVITIES,
  INITIAL_DRAFTS,
  INITIAL_PLATFORM_SETTINGS,
} from '../data/mockData';

export const PLATFORM_STORAGE_KEY = 'schlar_platform_data_v1';
export const ACTIVE_ROLE_KEY = 'schlar_active_role';

export interface PlatformState {
  exams: Exam[];
  questions: Question[];
  users: DemoUser[];
  results: ExamResult[];
  schedules: ScheduleItem[];
  activities: ActivityLog[];
  drafts: QuestionPaperDraft[];
  settings: PlatformSettings;
  activeRole: UserRole | null;
}

/**
 * Loads platform state from browser localStorage.
 * Gracefully falls back to pristine INITIAL_* constants if storage is absent or malformed.
 */
export function loadPlatformState(): PlatformState {
  try {
    const rawData = localStorage.getItem(PLATFORM_STORAGE_KEY);
    const savedRole = localStorage.getItem(ACTIVE_ROLE_KEY) as UserRole | null;

    if (!rawData) {
      return {
        exams: INITIAL_EXAMS,
        questions: INITIAL_QUESTIONS,
        users: INITIAL_USERS,
        results: INITIAL_RESULTS,
        schedules: INITIAL_SCHEDULES,
        activities: INITIAL_ACTIVITIES,
        drafts: INITIAL_DRAFTS,
        settings: INITIAL_PLATFORM_SETTINGS,
        activeRole: savedRole || null,
      };
    }

    const parsed = JSON.parse(rawData);

    return {
      exams: Array.isArray(parsed.exams) && parsed.exams.length > 0 ? parsed.exams : INITIAL_EXAMS,
      questions: Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed.questions : INITIAL_QUESTIONS,
      users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : INITIAL_USERS,
      results: Array.isArray(parsed.results) ? parsed.results : INITIAL_RESULTS,
      schedules: Array.isArray(parsed.schedules) ? parsed.schedules : INITIAL_SCHEDULES,
      activities: Array.isArray(parsed.activities) ? parsed.activities : INITIAL_ACTIVITIES,
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : INITIAL_DRAFTS,
      settings: parsed.settings || INITIAL_PLATFORM_SETTINGS,
      activeRole: parsed.activeRole || savedRole || null,
    };
  } catch (err) {
    console.warn('[SCHLAR Storage] Failed to load cached state, loading initial defaults:', err);
    return {
      exams: INITIAL_EXAMS,
      questions: INITIAL_QUESTIONS,
      users: INITIAL_USERS,
      results: INITIAL_RESULTS,
      schedules: INITIAL_SCHEDULES,
      activities: INITIAL_ACTIVITIES,
      drafts: INITIAL_DRAFTS,
      settings: INITIAL_PLATFORM_SETTINGS,
      activeRole: null,
    };
  }
}

/**
 * Persists current platform state to localStorage.
 */
export function savePlatformState(state: Partial<PlatformState>): void {
  try {
    const existing = loadPlatformState();
    const updated: PlatformState = {
      ...existing,
      ...state,
    };
    localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify(updated));
    if (state.activeRole !== undefined) {
      if (state.activeRole) {
        localStorage.setItem(ACTIVE_ROLE_KEY, state.activeRole);
      } else {
        localStorage.removeItem(ACTIVE_ROLE_KEY);
      }
    }
  } catch (err) {
    console.error('[SCHLAR Storage] Error persisting platform state:', err);
  }
}

/**
 * Resets local demo data to default baseline.
 */
export function resetPlatformState(): PlatformState {
  try {
    localStorage.removeItem(PLATFORM_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
    // Clear any active CBT test sessions
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('schlar_cbt_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('[SCHLAR Storage] Error resetting storage:', err);
  }

  return {
    exams: INITIAL_EXAMS,
    questions: INITIAL_QUESTIONS,
    users: INITIAL_USERS,
    results: INITIAL_RESULTS,
    schedules: INITIAL_SCHEDULES,
    activities: INITIAL_ACTIVITIES,
    drafts: INITIAL_DRAFTS,
    settings: INITIAL_PLATFORM_SETTINGS,
    activeRole: null,
  };
}
