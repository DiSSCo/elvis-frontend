import axios from 'axios';
// import { DialogProgrammatic as Dialog, ToastProgrammatic as Toast } from 'buefy';
// import { i18n } from '@/i18n';
import { getToken } from './auth';

class HttpInterceptor {
  tokenInterceptor() {
    axios.interceptors.request.use(
      (config) => {
        config.headers.Authorization = config.headers.Authorization || `Bearer ${getToken()}`;
        return config;
      },
      (error) => Promise.reject(error),
    );

    // axios.interceptors.response.use(
    //   response => {
    //     if (response.status >= 200 && response.status < 300) {
    //       return Promise.resolve(response);
    //     }
    //     return Promise.reject(response);
    //   },
    //   error => {
    //     if (error.response.status) {
    //       const { status } = error.response;
    //       const message = i18n.te(`error_handling.${status}`)
    //         ? i18n.t(`error_handling.${status}`)
    //         : i18n.t('error_handling.default');

    //       Toast.open({
    //         message: `Error: ${status}: ${message.description}`
    //         // type: 'is-danger'
    //       });

    //       // Dialog.alert({
    //       //   title: `Error: ${status}`,
    //       //   message: `<h2>${message.title}</h2><div><small>${
    //       //     message.description
    //       //   }</small></div><br/><div class="has-text-danger"><small>${
    //       //     error?.response?.data?.description || ''
    //       //   }</small></div>`,
    //       //   type: 'is-danger',
    //       //   hasIcon: true,
    //       //   icon: 'alert-circle is-large',
    //       //   iconPack: 'mdi',
    //       //   ariaRole: 'alertdialog',
    //       //   ariaModal: true
    //       // });

    //       return Promise.reject(error.response);
    //     }
    //   }
    // );
  }
}

const httpInterceptor = new HttpInterceptor();
export default httpInterceptor;
