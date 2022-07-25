import Vue from 'vue';
import Router from 'vue-router';
import { getPermissions, isAuthenticated, isOwnInstitution } from '@/modules/core/utils/auth';
import { checkActiveTaCall } from '@/services/callsService';
import callsRoutes from '@/modules/calls/routes';
import facilitiesRoutes from '@/modules/facilities/routes';
import institutionsRoutes from '@/modules/institutions/routes';
import requestersRoutes from '@/modules/requesters/routes';
import requestsRoutes from '@/modules/requests/routes';
import adminRoutes from '@/modules/admin/routes';

Vue.use(Router);

function load(component) {
  return () => import(`@/modules/core/${component}.vue`);
}

const routes = [
  {
    path: '/',
    redirect: '/calls'
    // name: 'dashboard',
    // component: load('DashBoard')
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: load('Welcome')
  },
  {
    path: '/register',
    name: 'register',
    component: load('Register')
  },
  {
    path: '/collections',
    name: 'collections',
    component: load('Collections')
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
    component: load('Help')
  },
  {
    path: '/profile',
    name: 'profile',
    component: load('Profile')
  },
  {
    path: '/privacy-statement',
    name: 'privacy-statement',
    component: load('PrivacyStatement')
  },
  {
    path: '*',
    name: 'message',
    component: load('Message'),
    props: true
  }
];

const router = new Router({
  mode: 'history',
  routes
});

router.beforeEach(async (to, from, next) => {
  await Vue.nextTick();
  const allPermissions = getPermissions();

  if (
    isAuthenticated() ||
    to.path === '/login' ||
    to.path === '/welcome' ||
    to.path === '/register' ||
    to.path === '/privacy-statement' ||
    to.path === '/reset'
  ) {
    let route;
    if (to.meta?.permissions) {
      const permission = Array.isArray(to.meta.permissions)
        ? to.meta.permissions.some(p => allPermissions.includes(p))
        : allPermissions.includes(to.meta.permissions);

      route = permission ? {} : { name: 'message', params: { status: 403, 0: to.path } };

      if (to.meta?.checkInstitution) {
        const { instId } = to.params;
        route = isOwnInstitution(instId) ? {} : { name: 'message', params: { status: 403, 0: to.path } };
      }
      if (to.meta?.checkActiveTaCall) {
        const isActiveCall = await checkActiveTaCall();
        route = !isActiveCall ? {} : { name: 'message', params: { status: 403, 0: to.path } };
      }
    }

    return next(route);
  }

  return next('/welcome');
});

export default router;
