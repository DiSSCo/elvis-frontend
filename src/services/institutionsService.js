import axios from 'axios';
import { parseField } from '@/modules/core/utils/helpers';
import { search } from './searchService';

export async function fetchInstitutions(q = '') {
  const queries = [];
  queries.push({
    type: 'and',
    criteria: [
      {
        field: 'title',
        type: 'like',
        value: q,
      },
    ],
  });

  return search('institutions', queries);
}

export async function fetchInstitutionsNoToken() {
  return axios.get('/institutions/institution_view');
}

export async function fetchInstitution(id) {
  return axios.get(`/institutions/${id}`);
}

export async function updateField(payload) {
  payload.fieldId = parseField(payload.fieldId);
  const { context, fieldId, value } = payload;
  if (context.resource === 'institutions') {
    const updatedField = { fieldId, fieldValue: value };
    return axios.post(`/institutions/${context.institutionId}/setFormValue`, updatedField);
  }
}

export async function updateCetaf(payload) {
  const { context, name, cetaf } = payload;
  if (context.resource === 'institutions') {
    const updatedCetaf = { name, cetaf };
    return axios.post(`/institutions/${context.institutionId}/change_name`, updatedCetaf);
  }
}

export async function removeGroup(payload) {
  const { context, path, key } = payload;
  return axios.post(`/institutions/${context.institutionId}/delete-group`, {
    groupId: `${path}[${key}]`,
  });
}

export async function addUserToInstitution(institutionId, userId) {
  return axios.post(`/institutions/${institutionId}/people/invite`, {
    id: userId,
  });
}

export async function removeUserFromInstitution(institutionId, userId) {
  return axios.post(`/institutions/${institutionId}/people/remove`, {
    id: userId,
  });
}

export async function fetchPeople(institutionId) {
  return axios.get(`/institutions/${institutionId}/people`);
}
