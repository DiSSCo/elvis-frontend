const institutionsRoutes = [
  {
    path: '/institutions',
    name: 'institutions',
    component: () => import(/* webpackChunkName: "institutions" */ './Institutions')
  },
  {
    path: '/institutions/:instId',
    name: 'institution-details',
    component: () => import(/* webpackChunkName: "institution" */ './Institution')
  },
  {
    path: '/institutions/:instId/edit',
    name: 'institution-edit',
    component: () => import(/* webpackChunkName: "edit-institution" */ './EditInstitution'),
    meta: { permissions: 'institution_edit', checkInstitution: true }
  }
];

export default institutionsRoutes;
