/* eslint-disable no-sequences */
/* eslint-disable no-return-assign */
import axios from 'axios';
import { parseField, toObject } from '@/modules/core/utils/helpers';
import { search } from './searchService';

export async function fetchFilteredRequests(queries) {
  return search('requests', queries);
}

export async function fetchAssignedRequests(queries) {
  return search('requestsForms', queries);
}

export async function fetchRequestId(callId) {
  return axios.post('/call-requests', { callId });
}

export async function fetchRequestData(payload) {
  const isCoordinator = payload.isCoordinator ? '/coordinator' : '';
  const id = payload.id ? payload.id : payload;

  try {
    const result = await axios.get(`/call-requests/${id}${isCoordinator}`);

    if (result.data?.institutions?.length) {
      result.data.institutions.forEach((institution) => {
        const fields = toObject(
          institution.fieldValues.reduce((obj, item) => {
            obj[item.fieldId] = item.value; return obj;
          }, {}),
        );
        institution.fieldValues = fields;
      });
    }

    const fieldVals = toObject(
      result.data.fieldValues.reduce((obj, item) => {obj[item.fieldId] = item.value; return obj;}, {}),
    );
    result.data.fieldValues = fieldVals;

    return result.data;
  } catch (error) {
    console.log(error);
  }
}

export async function updateField(id, payload) {
  payload.fieldId = parseField(payload.fieldId);
  const { context, fieldId, value } = payload;
  const institutionId = context?.institutionId || null;
  const updatedField = institutionId ? { institutionId, fieldId, value } : { fieldId, value };

  if (context?.resource === 'requests' && payload.fieldId) {
    return axios.post(`/call-requests/${id}/set-field`, updatedField);
  }
}

export async function removeGroup(id, payload) {
  const { institutionId } = payload.context;
  const { path, key } = payload;

  return axios.post(`/call-requests/${id}/delete-group`, {
    institutionId,
    groupId: `${path}[${key}]`,
  });
}

export async function submitRequest(reqId) {
  return axios.post(`/call-requests/${reqId}/submit`);
}

export async function approveRequest(requestId) {
  return axios.post(`/call-requests/${requestId}/coordinator/approve`);
}

export async function unapproveRequest(requestId) {
  return axios.post(`/call-requests/${requestId}/coordinator/undo-approve`);
}

export async function postComments(requestId, payload) {
  return axios.post(`/call-requests/${requestId}/comments`, payload);
}

export async function fetchComments(requestId) {
  return axios.get(`/call-requests/${requestId}/comments`);
}

export async function downLoadAllComments(requestId) {
  return axios.get(`/call-requests/${requestId}/comments/download`, {
    responseType: 'blob',
  });
}

export async function addInstitution(institutionId, requestId) {
  return axios.post(`/call-requests/${requestId}/add-institution`, {
    institutionId,
  });
}

export async function removeInstitution(institutionId, requestId) {
  return axios.post(`/call-requests/${requestId}/delete-institution`, {
    institutionId,
  });
}

export async function withdrawRequest(requestId) {
  return axios.post(`call-requests/${requestId}/withdraw`);
}

export async function deleteRequest(requestId) {
  axios.post(`/call-requests/${requestId}/delete`);
}

export async function downLoadRequest(requestId) {
  return axios.get(`/call-requests/${requestId}/download`, {
    responseType: 'blob',
  });
}

export async function createScore(callRequestId) {
  return axios.post(`/call-requests/${callRequestId}/scorer/create`);
}

export async function deleteScore(callRequestId, scoreFormId) {
  return axios.post(`/call-requests/${callRequestId}/scorer/${scoreFormId}/delete`);
}

export async function viewScore(callRequestId, scoreFormId) {
  return axios.get(`/call-requests/${callRequestId}/scorer/${scoreFormId}`);
}

export async function updateScore(callRequestId, scoreFormId, payload) {
  return axios.post(`/call-requests/${callRequestId}/scorer/${scoreFormId}/score`, payload);
}
