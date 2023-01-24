import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import { getPermissions, isAuthenticated, isOwnInstitution } from '@/modules/core/utils/auth';
import { checkActiveTaCall } from '@/services/callsService';
import callsRoutes from '@/modules/calls/routes';
import facilitiesRoutes from '@/modules/facilities/routes';
import institutionsRoutes from '@/modules/institutions/routes';
import requestersRoutes from '@/modules/requesters/routes';
import requestsRoutes from '@/modules/requests/routes';
import adminRoutes from '@/modules/admin/routes';

import Welcome from '@/modules/core/Welcome.vue';
import Register from '@/modules/core/Register.vue';
import Collections from '@/modules/core/Collections.vue';
import Help from '@/modules/core/Help.vue';
import Profile from '@/modules/core/Profile.vue';
import PrivacyStatement from '@/modules/core/PrivacyStatement.vue';
import Message from '@/modules/core/Message.vue';

const routes = [
  {
    path: '/',
    redirect: '/calls',
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: Welcome,
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/collections',
    name: 'collections',
    component: Collections,
  },
  ...facilitiesRoutes,
  ...callsRoutes,
  ...institutionsRoutes,
  ...requestersRoutes,
  ...requestsRoutes,
  ...adminRoutes,
  {
    path: '/help',
    name: 'help',
    component: Help,
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
  },
  {
    path: '/privacy-statement',
    name: 'privacy-statement',
    component: PrivacyStatement,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'message',
    component: Message,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  await nextTick();
  const allPermissions = getPermissions();

  if (
    isAuthenticated()
    || to.path === '/login'
    || to.path === '/welcome'
    || to.path === '/register'
    || to.path === '/privacy-statement'
    || to.path === '/reset'
  ) {
    let route;
    if (to.meta?.permissions) {
      const permission = Array.isArray(to.meta.permissions)
        ? to.meta.permissions.some(p => allPermissions.includes(p))
        : allPermissions.includes(to.meta.permissions);

      if (!permission) {
        route = { name: 'message', params: { status: 403, 0: to.path } };
      }

      if (to.meta?.checkInstitution) {
        const { instId } = to.params;

        if (!isOwnInstitution(instId)) {
          route = { name: 'message', params: { status: 403, 0: to.path } };
        }
      }
      if (to.meta?.checkActiveTaCall) {
        const isActiveCall = await checkActiveTaCall();

        if (isActiveCall) {
          route = { name: 'message', params: { status: 403, 0: to.path } }
        }
      }
    }
    
    return next(route);
  }

  return next('/welcome');
});

export default router;
