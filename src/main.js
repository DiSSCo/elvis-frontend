/* eslint-disable no-new */
import Vue from 'vue';
import Buefy from 'buefy';
import VueKeyCloak from '@dsb-norge/vue-keycloak-js';
import axios from 'axios';
import VueAxios from 'vue-axios';
import Vuelidate from 'vuelidate';
import VueScrollactive from 'vue-scrollactive';
import { getUserProfile } from '@/services/usersService';
import { setKeycloak, setProfile } from '@/modules/core/utils/auth';
import httpInterceptor from '@/modules/core/utils/http-interceptor';
import App from './App';
import router from './router';
import { i18n } from './i18n';

Vue.use(VueScrollactive);

const VueScrollTo = require('vue-scrollto');
Vue.use(VueScrollTo);

Vue.use(Vuelidate);

Vue.use(Buefy, {
  defaultUseHtml5Validation: false
});

Vue.use(VueAxios, axios);
Vue.axios.defaults.baseURL = process.env.VUE_APP_ELVIS_API;

function showError(error) {
  new Vue({
    el: '#elvis',
    render: h =>
      h(
        'h1',
        {
          class: 'center'
        },
        `Something went wrong here: ${error}`
      )
  });
}

axios
  .get('/config')
  .then(response => {
    if (response) {
      const kcConfig = response.data.authConfig;
      const { clientId, realm, url } = kcConfig;

      Vue.use(VueKeyCloak, {
        init: { onLoad: 'check-sso', checkLoginIframe: false },
        config: { clientId, realm, url },
        onReady: async keycloak => {
          setKeycloak(keycloak);
          httpInterceptor.tokenInterceptor();
          if (keycloak.token) {
            const profile = await getUserProfile(keycloak.token);
            setProfile(profile.data);
          }
          new Vue({
            el: '#elvis',
            router,
            i18n,
            render: h => h(App)
          });
        },
        onInitError: error => {
          showError(error);
        }
      });
    } else {
      showError('');
    }
  })
  .catch(error => {
    showError(error);
  });

Vue.config.productionTip = false;
Vue.config.performance = true;
Vue.config.errorHandler = (err, vm, info) => {
  // eslint-disable-next-line
  console.error(err);
  // eslint-disable-next-line
  console.error(vm);
  // eslint-disable-next-line
  console.error(info);
  // eslint-disable-next-line
  console.error('info end');
};

Vue.config.warnHandler = (msg, vm, trace) => {
  // eslint-disable-next-line
  console.warn(msg);
  // eslint-disable-next-line
  console.warn(vm);
  // eslint-disable-next-line
  console.warn(trace);
  // eslint-disable-next-line
  console.warn('trace end');
};
