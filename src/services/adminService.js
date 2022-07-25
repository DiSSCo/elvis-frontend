import axios from 'axios';
import { parseField } from '@/modules/core/utils/helpers';
import { search } from './searchService';

export async function fetchSettingsByKey(key) {
  return axios.get(`/admin/settings/${key}`);
}

export async function fetchSettings(queries = []) {
  return search('settings', queries);
}

export async function updateField(payload) {
  payload.fieldId = parseField(payload.fieldId);
  const { context, fieldId, value } = payload;
  if (context?.resource === 'settings') {
    const updatedField = { key: fieldId, type: value.type, value: value.value };
    return axios.post(`/admin/settings`, updatedField);
  }
}

export async function updateSettings(payload) {
  return axios.post(`/admin/settings`, payload);
}
