const facilitiesRoutes = [
  {
    path: '/facilities',
    name: 'facilities',
    component: () => import(/* webpackChunkName: "facilities" */ './Facilities')
  },
  {
    path: '/institutions/:instId/facilities/:id',
    name: 'facility-details',
    component: () => import(/* webpackChunkName: "facility" */ './Facility')
  },
  {
    path: '/institutions/:instId/new-facility',
    name: 'new-facility',
    component: () => import(/* webpackChunkName: "create-facility" */ './CreateFacility'),
    meta: { permissions: 'facility_create', checkInstitution: true }
  },
  {
    path: '/institutions/:instId/facilities/:id/new',
    name: 'facility-new',
    component: () => import(/* webpackChunkName: "create-facility" */ './EditFacility'),
    meta: { permissions: 'facility_create', checkInstitution: true }
  },
  {
    path: '/institutions/:instId/facilities/:id/edit',
    name: 'facility-edit',
    component: () => import(/* webpackChunkName: "edit-facility" */ './EditFacility'),
    meta: { permissions: 'facility_edit', checkInstitution: true, checkActiveTaCall: true }
  }
];

export default facilitiesRoutes;
