import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import RadioField from '@/modules/core/components/ui/formElements/RadioField';

let wrapper;
const localVue = createLocalVue();
localVue.use(Buefy);

beforeEach(() => {
  wrapper = mount(RadioField, {
    localVue,
  });
});

afterEach(() => {
  wrapper.destroy();
});

describe('RadioField', () => {
  it('should render radios based on options', () => {
    wrapper.setProps({ options: ['a', 'b'] });
    expect(wrapper.findAll('input[type="radio"]').length).toBe(2);
  });

  it('should emit on input', () => {
    wrapper.setProps({ options: ['a', 'b'] });
    const radio = wrapper.findAll('input[type="radio"]').at(1);
    radio.trigger('click');
    expect(wrapper.emitted('input')).toBeTruthy();
  });
});
