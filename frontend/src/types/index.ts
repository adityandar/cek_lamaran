export type JobStatus = 'WISHLIST' | 'APPLIED' | 'IN_PROGRESS' | 'REJECTED' | 'OFFERED';

export const LOCKED_STATUSES: JobStatus[] = ['REJECTED', 'OFFERED'];

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  jobId: string;
}

export interface Job {
  id: string;
  companyName: string;
  role: string | null;
  status: JobStatus;
  sourceUrl: string | null;
  description: string | null;
  companyDomain: string | null;
  notes?: Note[];
  updatedAt: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
