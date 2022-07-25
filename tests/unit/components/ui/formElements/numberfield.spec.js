import { createLocalVue, shallowMount } from '@vue/test-utils';
import NumberField from '@/modules/core/components/ui/formElements/NumberField';

let wrapper;
const localVue = createLocalVue();

beforeEach(() => {
  wrapper = shallowMount(NumberField, {
    localVue
  });
});

afterEach(() => {
  wrapper.destroy();
});

describe('NumberField', () => {
  it('should default render the inputfield', () => {
    wrapper.setProps({ editable: true });
    expect(wrapper.find('input[type="number"]').exists()).toBe(true);
  });

  it('should not render the inputfield if editable is false', () => {
    wrapper.setProps({ editable: false });
    expect(wrapper.find('input[type="number"]').exists()).toBe(false);
  });

  it('should prevent user from typing in non-numbers', () => {
    const checkIfNumber = jest.spyOn(wrapper.vm, 'checkIfNumber');
    wrapper.setMethods({ checkIfNumber });

    const field = wrapper.find('input[type="number"]');
    field.setValue('a');
    wrapper.trigger('keypress');
    expect(checkIfNumber).toBeCalled();
    expect(field.element.value).toHaveLength(0);
  });

  it('should only be allowed to type in numbers', () => {
    const checkIfNumber = jest.spyOn(wrapper.vm, 'checkIfNumber');
    wrapper.setMethods({ checkIfNumber });

    const field = wrapper.find('input[type="number"]');
    field.setValue(1);
    wrapper.trigger('keypress');
    expect(checkIfNumber).toBeCalled();
    expect(field.element.value).toHaveLength(1);
  });
});
