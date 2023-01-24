import { createLocalVue, shallowMount } from '@vue/test-utils';
import TextField from '@/modules/core/components/ui/formElements/TextField';

let wrapper;
const localVue = createLocalVue();

beforeEach(() => {
  wrapper = shallowMount(TextField, {
    localVue,
  });
});

afterEach(() => {
  wrapper.destroy();
});

describe('TextField', () => {
  it('should default render the textarea', () => {
    wrapper.setProps({ editable: true });
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('should not render the textarea if editable is false', () => {
    wrapper.setProps({ editable: false });
    expect(wrapper.find('textarea').exists()).toBe(false);
  });
});
