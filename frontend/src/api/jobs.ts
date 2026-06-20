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

export async function createJob(token: string, input: string, companyName?: string) {
  const res = await fetch(API, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ input, companyName }),
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
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function deleteJob(token: string, id: string) {
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  if (!res.ok) throw new Error('Failed to delete job');
}
