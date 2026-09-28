import { apiRequest } from './api.js';

export async function getSavedList() {
  try {
    const res = await apiRequest('/saved');
    if (res?.success) return res;
  } catch (err) {}

  // Fallback to local storage
  try {
    const local = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
    return { success: true, saved: local, data: local };
  } catch (e) {
    return { success: true, saved: [], data: [] };
  }
}

export async function getSavedItem(id) {
  try {
    return await apiRequest(`/saved/${id}`);
  } catch (err) {
    const local = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
    const item = local.find(x => String(x.id) === String(id));
    if (item) return { success: true, data: item };
    throw err;
  }
}

export async function createSaved(savedData) {
  try {
    const res = await apiRequest('/saved', {
      method: 'POST',
      body: JSON.stringify(savedData),
    });
    if (res?.success) return res;
  } catch (err) {}

  const local = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
  const entry = { id: Date.now(), ...savedData, createdAt: new Date().toISOString() };
  local.unshift(entry);
  localStorage.setItem('code3d_saved_programs', JSON.stringify(local));
  return { success: true, data: entry };
}

export async function updateSaved(id, savedData) {
  try {
    const res = await apiRequest(`/saved/${id}`, {
      method: 'PUT',
      body: JSON.stringify(savedData),
    });
    if (res?.success) return res;
  } catch (err) {}

  const local = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
  const idx = local.findIndex(x => String(x.id) === String(id));
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...savedData, updatedAt: new Date().toISOString() };
    localStorage.setItem('code3d_saved_programs', JSON.stringify(local));
  }
  return { success: true };
}

export async function deleteSaved(id) {
  try {
    await apiRequest(`/saved/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {}

  try {
    const local = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
    const filtered = local.filter(x => String(x.id) !== String(id));
    localStorage.setItem('code3d_saved_programs', JSON.stringify(filtered));
  } catch (e) {}
  return { success: true };
}
