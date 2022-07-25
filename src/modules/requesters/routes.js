const requestersRoutes = [
  {
    path: '/requesters',
    name: 'requesters',
    component: () => import(/* webpackChunkName: "requesters" */ './Requesters')
  },
  {
    path: '/requesters/:id',
    name: 'requester-details',
    component: () => import(/* webpackChunkName: "requester" */ './Requester')
  }
];

export default requestersRoutes;
