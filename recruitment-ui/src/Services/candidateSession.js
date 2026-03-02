function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getCandidateIdFromToken() {
  const token = localStorage.getItem('token');
  const payload = decodeJwtPayload(token);
  if (!payload) return '';

  const tokenKeys = ['candidateId', 'candidate_id', 'CandidateId', 'nameid', 'sub'];
  for (const key of tokenKeys) {
    const value = payload[key];
    if (value) return value;
  }

  return '';
}

export function getCandidateIdFromSession() {
  const directKeys = ['candidateId', 'CandidateId', 'candidate_id'];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  const jsonKeys = ['user', 'profile', 'authUser'];
  for (const key of jsonKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.candidateId) return parsed.candidateId;
      if (parsed?.CandidateId) return parsed.CandidateId;
      if (parsed?.candidate_id) return parsed.candidate_id;
    } catch {
      // ignore invalid JSON and try next key
    }
  }

  const fromToken = getCandidateIdFromToken();
  if (fromToken) return fromToken;

  return '';
}

// Bật true để test nhanh khi chưa map candidateId từ login.
export const DEV_BYPASS_LOGIN_TO_SAVE = false;

export const DEV_CANDIDATE_ID = 'B1111111-1111-1111-1111-111111111111';