export type JobStatus = 'APPLIED' | 'IN_PROGRESS' | 'REJECTED' | 'OFFERED';

export interface Job {
  id: string;
  companyName: string;
  status: JobStatus;
  sourceUrl: string | null;
  description: string | null;
  companyDomain: string | null;
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
