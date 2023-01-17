<template>
  <div v-if="facility">
    <form @submit.prevent>
      <component v-for="field in fields" :is="field.type" :key="field.id" :value="facility.fieldValues[field.id]"
        :path="[field.id]" :context="{ resource: 'facilities', institutionId: facility.institutionId }"
        :label="field.label" :fields="field.fields" :editable="editable" v-bind="{ ...field.options,
        validation: v$.facility.fieldValues[field.id] }" />
    </form>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { fetchInstitution } from '@/services/institutionsService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import FieldGroupRepeatable from '@/modules/core/components/ui/formElements/FieldGroupRepeatable.vue';
import fields from '../schemas/fields.json';

export default {
  components: {
    FieldRow,
    FieldGroupRepeatable,
  },

  props: {
    facility: {
      type: [Object, Array],
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const v$ = useVuelidate();

    return { v$: v$ };
  },

  data() {
    return {
      fields: fields.general,
    };
  },

  validations() {
    return {
      facility: {
        fieldValues: {
          nameEng: {
            required,
          },
        },
      },
    };
  },

  created() {
    this.lookupAddresses();
  },

  methods: {
    async lookupAddresses() {
      const { instId } = this.$route.params;
      try {
        const response = await fetchInstitution(instId);
        const institution = response.data.data.fieldValues;
        let mainAddress = `${institution.street.value} ${institution.number.value || ''} ${institution.city.value}`;
        mainAddress = mainAddress.replace(/\s\s+/g, ' ');
        const facilityAddress = this.fields.find((field) => field.id === 'institution_address');
        const adressesSet = new Set();
        adressesSet.add(mainAddress);
        if (institution.aff_address) {
          Object.values(institution.aff_address).forEach((addr) => {
            if (addr.street.value && addr.city.value) {
              let address = `${addr.street.value} ${addr.number?.value || ''} ${addr.city.value}`;
              address = address.replace(/\s\s+/g, ' ');
              adressesSet.add(address);
            }
          });
        }

        facilityAddress.options.fieldOptions.options = Array.from(adressesSet);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
