const adminRoutes = [
  {
    path: '/settings',
    name: 'settings',
    component: () => import(/* webpackChunkName: "settings" */ './Settings'),
    meta: { permissions: 'settings_view' }
  },

  {
    path: '/stats',
    name: 'stats',
    component: () => import(/* webpackChunkName: "dashboard" */ './DashBoard'),
    meta: { permissions: 'settings_view' }
  }
];

export default adminRoutes;
