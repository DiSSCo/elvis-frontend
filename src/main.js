import { createApp, h } from 'vue';
import httpInterceptor from '@/modules/core/utils/http-interceptor';
import { setKeycloak, setProfile } from '@/modules/core/utils/auth';
import { getUserProfile } from '@/services/usersService';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueKeyCloak from '@dsb-norge/vue-keycloak-js';
import mitt from 'mitt';
import Oruga from '@oruga-ui/oruga-next';
import '@oruga-ui/oruga-next/dist/oruga-full.css';

import App from './App.vue';
import router from './router';
import i18n from './i18n';

const app = createApp(App);

const VueScrollTo = require('vue-scrollto');

app.use(VueAxios, axios);
app.axios.defaults.baseURL = 'https://elvis.dissco.tech/api';

function showError(error) {
  const errorMessage = h(
    'h1',
    {
      class: 'center',
    },
    `Something went wrong here: ${error}`,
  );

  const errorApp = createApp(errorMessage);

  errorApp.config.productionTip = false;
  errorApp.config.performance = true;
  errorApp.config.errorHandler = (err, vm, info) => {
    // eslint-disable-next-line
    console.error(err);
    // eslint-disable-next-line
    console.error(vm);
    // eslint-disable-next-line
    console.error(info);
    // eslint-disable-next-line
    console.error('info end');
  };

  errorApp.config.warnHandler = (msg, vm, trace) => {
    // eslint-disable-next-line
    console.warn(msg);
    // eslint-disable-next-line
    console.warn(vm);
    // eslint-disable-next-line
    console.warn(trace);
    // eslint-disable-next-line
    console.warn('trace end');
  };

  errorApp.mount('#elvis');
}

axios
  .get('/config')
  .then((response) => {
    if (response) {
      const kcConfig = response.data.authConfig;

      const { clientId, realm, url } = kcConfig;

      app.use(VueKeyCloak, {
        init: {
          flow: 'standard', // default
          checkLoginIframe: false, // default
          onLoad: 'check-sso',
        },
        config: { clientId: clientId, realm: realm, url: url },
        onReady: async (keycloak) => {
          setKeycloak(keycloak);
          httpInterceptor.tokenInterceptor();
          if (keycloak.token) {
            const profile = await getUserProfile(keycloak.token);
            setProfile(profile.data);
          }

          app.use(Oruga);
          app.use(VueScrollTo);
          app.use(router);
          app.use(i18n);

          const emitter = mitt();
          app.config.globalProperties.emitter = emitter;

          app.mount('#elvis');
        },
        onInitError: (error) => {
          showError(error);
        },
      });
    } else {
      showError('');
    }
  })
  .catch((error) => {
    showError(error);
  });

app.config.productionTip = false;
app.config.performance = true;
app.config.errorHandler = (err, vm, info) => {
  // eslint-disable-next-line
  console.error(err);
  // eslint-disable-next-line
  console.error(vm);
  // eslint-disable-next-line
  console.error(info);
  // eslint-disable-next-line
  console.error('info end');
};

app.config.warnHandler = () => {
  // eslint-disable-next-line
  // console.warn(msg);
  // eslint-disable-next-line
  // console.warn(vm);
  // eslint-disable-next-line
  // console.warn(trace);
  // eslint-disable-next-line
  // console.warn('trace end');
};
