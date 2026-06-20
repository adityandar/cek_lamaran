import { create } from 'zustand';
import type { Job } from '../types';
import * as jobsApi from '../api/jobs';

type ViewMode = 'LIST' | 'KANBAN';

interface JobState {
  jobs: Job[];
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
  fetchJobs: (token: string) => Promise<void>;
  addJob: (token: string, input: string, companyName?: string) => Promise<void>;
  updateStatus: (token: string, id: string, status: string) => Promise<void>;
  removeJob: (token: string, id: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  viewMode: 'LIST',
  loading: false,
  error: null,

  fetchJobs: async (token) => {
    set({ loading: true, error: null });
    try {
      const jobs = await jobsApi.getJobs(token);
      set({ jobs, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addJob: async (token, input, companyName) => {
    try {
      const job = await jobsApi.createJob(token, input, companyName);
      set((s) => ({ jobs: [job, ...s.jobs] }));
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  updateStatus: async (token, id, status) => {
    try {
      const updated = await jobsApi.updateJobStatus(token, id, status);
      set((s) => ({
        jobs: s.jobs.map((j) => (j.id === id ? updated : j)),
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  removeJob: async (token, id) => {
    try {
      await jobsApi.deleteJob(token, id);
      set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),
}));
