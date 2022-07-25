import axios from 'axios';
import { search } from './searchService';

export async function fetchCalls() {
  const queries = [
    {
      type: 'and',
      criteria: [
        {
          field: 'deleted_at',
          type: 'eq',
          value: null
        }
      ]
    }
  ];

  return search('calls', queries);
}

export async function checkActiveTaCall() {
  try {
    const response = await fetchCalls();
    return !!response.data.data.rows.filter(call => call.type === 'ta' && call.status === 'available').length;
  } catch (error) {
    console.log('error: ', error);
  }
}

export async function fetchCallData(id) {
  const queries = [
    {
      type: 'and',
      criteria: [
        {
          field: 'id',
          type: 'eq',
          value: id
        }
      ]
    }
  ];
  return search('calls', queries);
}
export async function createCall(newCall) {
  return axios.post('/calls', newCall);
}

export async function editCall(id, payload) {
  return axios.post(`/calls/${id}/update`, payload);
}

export async function deleteCall(id) {
  return axios.post(`/calls/${id}/delete`);
}
