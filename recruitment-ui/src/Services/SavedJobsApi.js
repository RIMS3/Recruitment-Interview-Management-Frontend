import { DEV_BYPASS_LOGIN_TO_SAVE } from './candidateSession';

// Thay đổi: Lấy URL gốc từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', ''); 
const DEV_SAVED_JOB_IDS_KEY = 'dev_saved_job_ids';

function buildAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('token');
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function readDevSavedIds() {
  try {
    const raw = localStorage.getItem(DEV_SAVED_JOB_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeDevSavedIds(ids) {
  localStorage.setItem(DEV_SAVED_JOB_IDS_KEY, JSON.stringify(ids));
}

async function parseApiError(response, fallbackMessage) {
  try {
    const data = await response.json();
    const message = data?.message || data?.error || data?.title;
    if (message) return message;
  } catch {
    // ignore invalid json
  }

  try {
    const text = await response.text();
    if (text) return text;
  } catch {
    // ignore read error
  }

  return fallbackMessage;
}

export async function getSavedJobIds(candidateId) {
  if (DEV_BYPASS_LOGIN_TO_SAVE) {
    return readDevSavedIds();
  }

  // Cập nhật: Sử dụng API_BASE_URL + path
  const response = await fetch(`${API_BASE_URL}/api/saved-jobs/${candidateId}/ids`, {
    headers: buildAuthHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Không tải được danh sách job đã lưu.'));
  }

  return response.json();
}

export async function getSavedJobs(candidateId) {
  if (DEV_BYPASS_LOGIN_TO_SAVE) {
    const savedIds = new Set(readDevSavedIds());
    if (savedIds.size === 0) return [];

    const allJobsRes = await fetch(`${API_BASE_URL}/api/jobs`, { credentials: 'include' });
    if (!allJobsRes.ok) {
      throw new Error(await parseApiError(allJobsRes, 'Không tải được danh sách job để lọc job đã lưu.'));
    }

    const allJobs = await allJobsRes.json();
    return allJobs.filter((job) => savedIds.has(String(job.idJobPost || job.jobId || job.id)));
  }

  const response = await fetch(`${API_BASE_URL}/api/saved-jobs/${candidateId}`, {
    headers: buildAuthHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Không tải được trang job đã lưu.'));
  }

  return response.json();
}

export async function toggleSavedJob(candidateId, jobId) {
  if (DEV_BYPASS_LOGIN_TO_SAVE) {
    const ids = new Set(readDevSavedIds());
    const normalizedJobId = String(jobId);

    if (ids.has(normalizedJobId)) {
      ids.delete(normalizedJobId);
      writeDevSavedIds(Array.from(ids));
      return { saved: false };
    }

    ids.add(normalizedJobId);
    writeDevSavedIds(Array.from(ids));
    return { saved: true };
  }

  const response = await fetch(`${API_BASE_URL}/api/saved-jobs/toggle`, {
    method: 'POST',
    headers: buildAuthHeaders({
      'Content-Type': 'application/json'
    }),
    credentials: 'include',
    body: JSON.stringify({ candidateId, jobId })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Không thể cập nhật trạng thái lưu job.'));
  }

  return response.json();
}

export async function unsaveJob(candidateId, jobId) {
  if (DEV_BYPASS_LOGIN_TO_SAVE) {
    const ids = readDevSavedIds().filter((id) => String(id) !== String(jobId));
    writeDevSavedIds(ids);
    return { success: true };
  }

  const response = await fetch(`${API_BASE_URL}/api/saved-jobs`, {
    method: 'DELETE',
    headers: buildAuthHeaders({
      'Content-Type': 'application/json'
    }),
    credentials: 'include',
    body: JSON.stringify({ candidateId, jobId })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Không thể bỏ lưu job.'));
  }

  return response.json();
}