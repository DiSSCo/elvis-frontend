import axios from 'axios';

export async function sendFeedback(formData) {
  return axios.post('/contact', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function fetchAttachments(url) {
  return axios.get(url);
}

export async function downloadAttachment(url, attachmentId) {
  return axios.get(`${url}/${attachmentId}/download`, {
    responseType: 'blob',
  });
}

export async function deleteAttachment(url, attachmentId) {
  return axios.post(`${url}/${attachmentId}/remove`);
}

export async function uploadAttachment(url, formData) {
  return axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function fetchAddress(address) {
  return axios.get(
    `https://nominatim.openstreetmap.org/search?q=${address}&limit=1&format=json&pretty=1&accept-language=nl`,
  );
}
