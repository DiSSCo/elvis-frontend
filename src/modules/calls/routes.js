const callsRoutes = [
  {
    path: '/calls',
    name: 'calls',
    component: () => import(/* webpackChunkName: "calls" */ './Calls')
  },
  {
    path: '/calls/call/:id',
    name: 'call-details',
    component: () => import(/* webpackChunkName: "calls" */ './Call')
  },
  {
    path: '/calls/call/:id/edit-call',
    name: 'edit-call',
    component: () => import(/* webpackChunkName: "editcall" */ './EditCall')
  },
  {
    path: '/calls/new-call',
    name: 'new-call',
    component: () => import(/* webpackChunkName: "newcall" */ './NewCall')
  }
];

export default callsRoutes;
