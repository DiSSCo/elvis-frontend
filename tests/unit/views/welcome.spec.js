import { createLocalVue, shallowMount, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import Welcome from '@/modules/Welcome';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('Welcome', () => {
  it('should render homepage if not authenticated', () => {
    const wrapper = shallowMount(Welcome, {
      localVue,
      computed: {
        isAuthenticated() {
          return false;
        },
      },
    });
    expect(wrapper.text()).toMatch('Virtual Access applications portal');
    wrapper.destroy();
  });

  it('should redirect to "/" if authenticated', () => {
    const wrapper = shallowMount(Welcome, {
      localVue,
      computed: {
        isAuthenticated() {
          return true;
        },
      },
      mocks: {
        $router: {
          push: jest.fn(),
        },
      },
    });
    const routerPush = jest.spyOn(wrapper.vm.$router, 'push');
    expect(routerPush).toHaveBeenCalledWith('/');
    wrapper.destroy();
  });

  it('should redirect to "/register" if registration btn is clicked', () => {
    const wrapper = mount(Welcome, {
      localVue,
      computed: {
        isAuthenticated() {
          return false;
        },
      },
      mocks: {
        $router: {
          push: jest.fn(),
        },
      },
    });
    const btn = wrapper.find('button');
    btn.trigger('click');
    const routerPush = jest.spyOn(wrapper.vm.$router, 'push');
    expect(routerPush).toHaveBeenCalledWith('/register');
    wrapper.destroy();
  });
});
