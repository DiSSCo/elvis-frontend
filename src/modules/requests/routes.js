const requestsRoutes = [
  {
    path: '/calls/:id/new-va-request',
    name: 'calls-new-va-request',
    component: () => import(/* webpackChunkName: "new-va-request" */ './NewVaRequest')
  },
  {
    path: '/calls/:id/edit-va-request/:reqid',
    name: 'calls-edit-va-request',
    component: () => import(/* webpackChunkName: "edit-va-request" */ './EditVaRequest')
  },
  {
    path: '/calls/:id/new-ta-request',
    name: 'calls-new-ta-request',
    component: () => import(/* webpackChunkName: "new-va-request" */ './NewTaRequest')
  },
  {
    path: '/calls/:id/edit-ta-request/:reqid',
    name: 'calls-edit-ta-request',
    component: () => import(/* webpackChunkName: "edit-va-request" */ './EditTaRequest')
  },
  {
    path: '/requests',
    name: 'requests',
    component: () => import(/* webpackChunkName: "requests" */ './Requests')
  },
  {
    path: '/requests/va/:id',
    name: 'request-details-va',
    component: () => import(/* webpackChunkName: "va-request" */ './VaRequest')
  },
  {
    path: '/requests/ta/:id',
    name: 'request-details-ta',
    component: () => import(/* webpackChunkName: "ta-request" */ './TaRequest')
  },
  {
    path: '/requests/ta/:id/scoring',
    name: 'request-scoring-ta',
    component: () => import(/* webpackChunkName: "ta-request" */ './TaRequestScoring'),
    meta: { permissions: 'request_score' }
  },
  {
    path: '/requests/ta/:id/scores',
    name: 'request-view-scores-ta',
    component: () => import(/* webpackChunkName: "ta-request" */ './TaRequestViewScores'),
    meta: { permissions: 'request_scores_view' }
  }
];

export default requestsRoutes;
