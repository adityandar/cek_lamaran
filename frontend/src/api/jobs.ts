const API = '/api/jobs';

function headers(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getJobs(token: string) {
  const res = await fetch(API, { headers: headers(token) });
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function getJob(token: string, id: string) {
  const res = await fetch(`${API}/${id}`, { headers: headers(token) });
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

export async function createJob(token: string, input: string, companyName?: string, role?: string, status?: string) {
  const res = await fetch(API, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ input, companyName, role, status }),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function updateJobStatus(token: string, id: string, status: string) {
  const res = await fetch(`${API}/${id}/status`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const msg = (await res.json()).message || 'Failed to update status';
    throw new Error(msg);
  }
  return res.json();
}

export async function updateJob(token: string, id: string, data: { companyName?: string; role?: string }) {
  const res = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}

export async function deleteJob(token: string, id: string) {
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  if (!res.ok) throw new Error('Failed to delete job');
}

export async function addNote(token: string, jobId: string, content: string) {
  const res = await fetch(`${API}/${jobId}/notes`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

export async function resolveJob(token: string, jobId: string, status: string, note: string) {
  const res = await fetch(`${API}/${jobId}/resolve`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error('Failed to resolve job');
  return res.json();
}

export async function updateNote(token: string, noteId: string, content: string) {
  const res = await fetch(`${API}/notes/${noteId}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}

export async function deleteNote(token: string, noteId: string) {
  const res = await fetch(`${API}/notes/${noteId}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  if (!res.ok) throw new Error('Failed to delete note');
}

export async function scrapeJob(token: string, url: string) {
  const res = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) return null;
  return res.json();
}
