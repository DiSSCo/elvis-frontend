import axios from 'axios';
import { search } from './searchService';
import { parseField } from '@/modules/core/utils/helpers';

export async function fetchFacilities(q = '') {
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

  if (q) {
    queries.push({
      type: 'and',
      criteria: [
        {
          field: 'title',
          type: 'like',
          value: q
        }
      ]
    });
  }
  return search('facilities', queries);
}

export async function fetchFacilityData(id) {
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
  return search('facilities', queries);
}

export async function fetchFacilitiesByInstitutionId(id) {
  const queries = [
    {
      type: 'and',
      criteria: [
        {
          field: 'deleted_at',
          type: 'eq',
          value: null
        },
        {
          field: 'institution_id',
          type: 'eq',
          value: id
        }
      ]
    }
  ];

  return search('facilities', queries);
}

export async function fetchNewFacilityId(institutionId) {
  return axios.post(`/institutions/${institutionId}/facilities`, { institutionId });
}

export async function updateField(institutionId, facilityId, payload) {
  payload.fieldId = parseField(payload.fieldId);
  const { context, fieldId, value } = payload;
  if (context.resource === 'facilities') {
    const updatedField = { fieldId, fieldValue: value };
    return axios.post(`/institutions/${institutionId}/facilities/${facilityId}/setFormValue`, updatedField);
  }
}

export async function deleteFacility(payload) {
  const { institutionId, id } = payload;
  return axios.post(`/institutions/${institutionId}/facilities/${id}/delete`);
}

export async function removeGroup(institutionId, facilityId, payload) {
  const { path, key } = payload;
  return axios.post(`/institutions/${institutionId}/facilities/${facilityId}/delete-group`, {
    groupId: `${path}[${key}]`
  });
}

export async function deleteImage(institutionId, facilityId, image) {
  return axios.post(`/institutions/${institutionId}/facilities/${facilityId}/images/${image}/remove`);
}

export async function fetchImage(institutionId, facilityId, image) {
  return axios.get(`/institutions/${institutionId}/facilities/${facilityId}/images/${image}`);
}
