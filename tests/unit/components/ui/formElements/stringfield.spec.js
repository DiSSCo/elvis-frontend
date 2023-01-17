import { createLocalVue, mount } from '@vue/test-utils';
import StringField from '@/modules/core/components/ui/formElements/StringField';

let wrapper;
const localVue = createLocalVue();

beforeEach(() => {
  wrapper = mount(StringField, {
    localVue,
  });
});

afterEach(() => {
  wrapper.destroy();
});

describe('StringField', () => {
  it('should default render the inputfield', () => {
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('should not render the inputfield if editable is false', () => {
    wrapper.setProps({ editable: false });
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('should emit on blur', () => {
    const field = wrapper.find('input[type="text"]');
    field.setValue('test123');
    field.trigger('blur');
    expect(field.emitted('input')).toBeTruthy();
  });

  it('sets the correct default data', () => {
    wrapper.setProps({ editable: false });
    wrapper.setData({ val: 'test123' });
    expect(wrapper.find('div').text()).toBe('test123');
  });
});
