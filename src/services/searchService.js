import axios from 'axios';

export async function search(index, queries, page = 1, perPage = 1000) {
  return axios.post('/search', {
    index,
    queries,
    perPage,
    page
  });
}

export function buildQuery(id = '', field = 'collection') {
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
  if (id) {
    queries.push({
      type: 'FieldQuery',
      operator: 'equals',
      value: id,
      field: `${field}.id`
    });
  }
  return {
    queries,
    type: 'AndQuery'
  };
}
