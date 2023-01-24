const requestersRoutes = [
  {
    path: '/requesters',
    name: 'requesters',
    component: () => import(/* webpackChunkName: "requesters" */ './Requesters.vue'),
  },
  {
    path: '/requesters/:id',
    name: 'requester-details',
    component: () => import(/* webpackChunkName: "requester" */ './Requester.vue'),
  },
];

export default requestersRoutes;
