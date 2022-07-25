import axios from 'axios';
import { search } from './searchService';

export async function fetchUsers() {
  const queries = [];
  return search('users', queries);
}

export async function fetchUserById(id) {
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
  return search('users', queries);
}

export async function createNewUser(newUser) {
  return axios.post('/registration', newUser);
}

export async function checkIfUserExists(email) {
  return axios.get(`/registration/${email}`);
}

export async function updateUserStatus(userId, status) {
  if (status) {
    return axios.post(`/users/${userId}/unban`);
  }
  return axios.post(`/users/${userId}/ban`, {
    reason: ''
  });
}

export async function getUserProfile(token = '') {
  if (token) {
    return axios.get('/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return axios.get('/profile');
}

export async function updateUserProfile(payload) {
  return axios.post('/profile', payload);
}

export async function fetchUserGroups() {
  return axios.get('/config');
}

export async function recoverPassword(email) {
  return axios.post('/password-recovery', { email });
}

export async function loginUser(credentials) {
  return axios.post('/login', credentials);
}

export async function resetPassword(payload) {
  return axios.post('/recovery/requester', payload);
}

export async function assignTaCoordinator(institutionId, userId, add) {
  const action = add ? 'add' : 'remove';
  return axios.post(`/institutions/${institutionId}/ta_coordinator/${action}/${userId}`);
}

export async function assignVaCoordinator(institutionId, userId, add) {
  const action = add ? 'add' : 'remove';
  return axios.post(`/institutions/${institutionId}/va_coordinator/${action}/${userId}`);
}

export async function assignModerator(institutionId, userId, add) {
  const action = add ? 'add' : 'remove';
  return axios.post(`/institutions/${institutionId}/institution_moderator/${action}/${userId}`);
}

export async function assignTaScorer(countryIsoCode, userId, add) {
  const action = add ? 'add' : 'remove';
  return axios.post(`/countries/${countryIsoCode}/ta_scorer/${action}/${userId}`);
}

export async function assignTafAdmin(countryIsoCode, userId, add) {
  const action = add ? 'add' : 'remove';
  return axios.post(`/countries/${countryIsoCode}/taf_admin/${action}/${userId}`);
}
