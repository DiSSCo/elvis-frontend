const adminRoutes = [
  {
    path: '/settings',
    name: 'settings',
    component: () => import(/* webpackChunkName: "settings" */ './Settings.vue'),
    meta: { permissions: 'settings_view' },
  },

  {
    path: '/stats',
    name: 'stats',
    component: () => import(/* webpackChunkName: "dashboard" */ './DashBoard.vue'),
    meta: { permissions: 'settings_view' },
  },
];

export default adminRoutes;
