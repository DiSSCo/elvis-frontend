<template>
  <div v-if="formData">
    <div class="action-bar">
      <div class="container">
        <o-button v-if="!editable" class="primaryButton" @click="editable = true">
          <span> <i class="feather icon-edit" /> {{ $t('profile.edit') }} </span>
        </o-button>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <h1>{{ $t('profile.my_profile') }}</h1>
        <div class="columns">
          <div class="column is-3 gravatar">
            <gravatar :initials="getInitials(formData.firstName, formData.lastName)" :size="175" />
          </div>
          <div class="column is-9">
            <div v-if="editable">
              <transition name="fade" mode="out-in" appear>
                <form @submit.prevent class="profile-form">
                  <component
                    v-for="(field, index) in fields"
                    :is="field.type"
                    :key="field.id"
                    :value="formData[field.id]"
                    :path="[field.id]"
                    :context="{ resource: 'profile' }"
                    :label="$t(field.label)"
                    v-bind="{ ...field.options }"
                    :style="{ order: index * 2 }"
                    :tabindex="index * 2"
                  />

                  <field-row
                    :label="$t('profile.birthday')"
                    :fieldOptions="{
                      validation: v$.formData.birthDate,
                      errorMessage: `Please enter a valid date of birth`
                    }"
                    :style="{ order: 7 }"
                  >
                    <div class="multiple-inputs is-6">
                      <div v-for="(part, index) of formData.birthDate"
                        :key="index" class="single-input is-4"
                      >
                        <input
                          type="text"
                          v-model.trim="part.value"
                          @blur="v$.formData.birthDate[index].$touch()"
                          ref="birthday"
                          tabindex="7"
                          :maxlength="part.maxLength"
                          :placeholder="part.placeHolder"
                          :class="{
                            'is-danger': v$.formData.birthDate[index].$dirty
                            && v$.formData.birthDate[index].$error
                          }"
                        />
                      </div>
                    </div>
                  </field-row>

                  <field-row
                    :label="$t('profile.orcid')"
                    :fieldOptions="{
                      validation: v$.formData.orcId,
                      errorMessage: `Please enter a valid ${$t('profile.orcid')}`
                    }"
                    :style="{ order: 9 }"
                  >
                    <div class="multiple-inputs">
                      <div v-for="(id, index) of formData.orcId"
                        :key="index"
                        class="single-input is-3"
                      >
                        <input
                          type="text"
                          v-model.trim="id.part"
                          @blur="index === formData.orcId.length - 1
                          ? v$.formData.orcId.$touch() : null"
                          @keyup="keyup($event, 4)"
                          maxlength="4"
                          ref="orcId"
                          tabindex="7"
                        />
                      </div>
                    </div>
                  </field-row>
                  <div class="action-btns" :style="{ order: 20 }">
                    <o-button @click="cancel" outlined class="cancelButton"> {{ $t('cancel') }} </o-button>
                    <o-button class="primaryButton" :loading="loading" @click="saveProfile">
                      {{ $t('profile.save') }}
                    </o-button>
                  </div>
                </form>
              </transition>
            </div>
            <div v-else>
              <transition name="fade" mode="out-in" appear>
                <div class="profile-view">
                  <div class="profile-view-row">
                    <span>{{ $t('profile.email_address') }}</span>
                    <span>{{ formData.email }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.gender') }}</span>
                    <span>{{ formData.gender ? capitalize(formData.gender) : 'Other' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.first_name') }}</span>
                    <span>{{ formData.firstName || '-' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.last_name') }}</span>
                    <span>{{ formData.lastName || '-' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.birthday') }}</span>
                    <span> {{ birthday }} </span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.nationality') }}</span>
                    <span>{{ formData.nationality || '-' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.orcid') }}</span>
                    <span v-if="parseOrcId(formData.orcId)">
                      <a :href="`https://orcid.org/${parseOrcId(formData.orcId)}`" target="blank">{{
                        sanitizeOrcId(parseOrcId(formData.orcId))
                      }}</a>
                    </span>
                    <span v-else>-</span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.employed_by') }}</span>
                    <span>{{ formData.relatedInstitutionName || '-' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.home_institution') }}</span>
                    <span>{{ formData.homeInstitutionName || '-' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>{{ $t('profile.country_other_institution') }}</span>
                    <span>{{ formData.countryOtherInstitution || '-' }}</span>
                  </div>

                  <div class="profile-view-row user-roles">
                    <span></span>
                    <span><strong>Assigned user roles</strong></span>
                  </div>
                  <div class="profile-view-row">
                    <span>Roles for Institution</span>
                    <span>{{ institutionName || '-' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>Roles</span>
                    <span>{{ institutionRoles || '-' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>Roles for Country</span>
                    <span>{{ countryName || '-' }}</span>
                  </div>
                  <div class="profile-view-row">
                    <span>Roles</span>
                    <span>{{ countryRoles || '-' }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import {
  required, maxLength, minLength, minValue, maxValue, numeric,
} from '@vuelidate/validators';
import { fetchInstitutions } from '@/services/institutionsService';
import { getUserProfile, updateUserProfile } from '@/services/usersService';
import { getProfile, setProfile } from '@/modules/core/utils/auth';
import { capitalize, sanitizeOrcId } from '@/modules/core/utils/helpers';
import Gravatar from '@/modules/core/components/ui/Gravatar.vue';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import countries from '@/modules/core/schemas/country-list.json';
import fields from './schemas/profile.json';

export default {
  components: {
    FieldRow,
    Gravatar,
  },

  setup() {
    return { v$: useVuelidate() };
  },

  computed: {
    institutionName() {
      const { institutionId } = this.profile.attributes;
      const [name] = this.institutions.filter((inst) => inst.id
      === institutionId).map((i) => i.name);
      return name;
    },

    countryName() {
      const { countryCode } = this.profile.attributes;
      const [name] = countries.filter((country) => country.code === countryCode).map((i) => i.name);
      return name;
    },

    institutionRoles() {
      const roles = ['institution moderator', 'ta coordinator', 'va coordinator'];
      return this.formData.groups
        .filter((role) => roles.includes(role))

        .join(', ');
    },

    countryRoles() {
      const roles = ['taf admin', 'ta scorer'];
      return this.formData.groups
        .filter((role) => roles.includes(role))

        .join(', ');
    },

    birthday() {
      return Number(this.formData.birthDate.year.value)
        ? `${this.formData.birthDate.day.value}-${this.formData.birthDate.month.value}-${this.formData.birthDate.year.value}`
        : '-';
    },
  },

  data() {
    return {
      fields: fields.data,
      formData: null,
      profile: null,
      editable: false,
      loading: false,
      disabled: true,
      institutions: null,
      gender: 'other',
      birthDate: {
        day: {
          value: '',
          placeHolder: 'dd',
          maxLength: 2,
        },
        month: {
          value: '',
          placeHolder: 'mm',
          maxLength: 2,
        },
        year: {
          value: '',
          placeHolder: 'yyyy',
          maxLength: 4,
        },
      },
      orcId: [{ part: '' }, { part: '' }, { part: '' }, { part: '' }],
      relatedInstitutionId: '',
      nationality: '',
      homeInstitutionId: '',
      countryOtherInstitution: '',
    };
  },

  validations: {
    formData: {
      firstName: {
        required,
      },
      lastName: {
        required,
      },
      birthDate: {
        required,
        day: {
          value: {
            required,
            numeric,
            minLength: minLength(2),
            maxLength: maxLength(2),
            minValue: minValue(1),
            maxValue: maxValue(31),
          },
        },
        month: {
          value: {
            required,
            numeric,
            minLength: minLength(2),
            maxLength: maxLength(2),
            minValue: minValue(1),
            maxValue: maxValue(12),
          },
        },
        year: {
          value: {
            required,
            numeric,
            minLength: minLength(4),
            maxLength: maxLength(4),
            minValue: minValue(1900),
            maxValue: maxValue(new Date().getFullYear()),
          },
        },
      },
      orcId: {
        required,
        $each: {
          part: {
            required,
            maxLength: maxLength(4),
            minLength: minLength(4),
          },
        },
      },
    },
  },

  async created() {
    this.emitter.on('updateField', this.handleFormField);
    this.profile = getProfile();
    await this.setFields();
    await this.setData();
  },

  beforeUnmount() {
    this.emitter.off('updateField');
  },

  methods: {
    handleFormField(event) {
      if (event.fieldId.includes('relatedInstitutionName')) {
        this.formData.relatedInstitutionName = event.value.value;
      }
      if (event.fieldId.includes('homeInstitutionName')) {
        this.formData.homeInstitutionName = event.value.value;
      }
      if (event.fieldId.includes('nationality')) {
        this.formData.nationality = event.value.value;
      }
      if (event.fieldId.includes('countryOtherInstitution')) {
        this.formData.countryOtherInstitution = event.value.value;
      }
      if (event.fieldId.includes('gender')) {
        this.formData.gender = event.value.value;
      }
    },

    parseOrcId(orcId) {
      const parsed = orcId.map((id) => id.part);
      return parsed.join('').length ? parsed.join('-') : '';
    },

    getInitials(firstName, lastName) {
      const firstChar = firstName.charAt(0);
      const lastChar = lastName.split(' ').pop().charAt(0);
      return `${firstChar}${lastChar}`;
    },

    capitalize(str) {
      return capitalize(str);
    },

    async setFields() {
      const institutionsFromResponse = await fetchInstitutions();
      this.institutions = institutionsFromResponse.data.data.rows;

      this.fields = this.fields.map((field) => {
        const copyField = { ...field };
        if (field.options.fieldOptions?.errorMessage) {
          field.options.fieldOptions.validation = this.v$.formData[field.id];
        }
        if (field.id === 'relatedInstitutionName') {
          copyField.options.fieldOptions.options = this.institutions.map(
            (inst) => inst.name,
          ).sort();
        }
        if (field.id === 'nationality') {
          copyField.options.fieldOptions.options = countries.map((country) => country.name).sort();
        }
        if (field.id === 'countryOtherInstitution') {
          copyField.options.fieldOptions.options = countries.map((country) => country.name).sort();
        }
        return copyField;
      });
    },

    setData() {
      if (!this.profile) return;
      this.profile.birthDateTime = this.profile.birthDateTime
        ? this.profile.birthDateTime.map((part) => {
          const copyPart = Number(part);
          return copyPart && copyPart < 10 ? `0${copyPart}` : `${copyPart}`;
        })
        : [null, null, null];
      [this.birthDate.year.value, this.birthDate.month.value,
        this.birthDate.day.value] = this.profile.birthDateTime;
      this.profile.birthDate = this.birthDate;

      const [relatedInstitutionName] = this.institutions
        .filter((institution) => institution.id === this.profile.attributes?.relatedInstitutionId)
        .map((i) => i.name);
      this.profile.relatedInstitutionName = relatedInstitutionName;

      const homeInstitutionName = this.profile.attributes?.homeInstitutionId;
      this.profile.homeInstitutionName = homeInstitutionName;

      const [countryName] = countries
        .filter((country) => country.name === this.profile.attributes?.nationality)
        .map((country) => country.name);
      this.profile.nationality = countryName;

      const [otherCountryName] = countries
        .filter((country) => country.name === this.profile.attributes?.countryOtherInstitution)
        .map((country) => country.name);
      this.profile.countryOtherInstitution = otherCountryName;

      if (this.profile.attributes.orcId) {
        const sanitizedOrcId = sanitizeOrcId(this.profile.attributes.orcId);
        const orcIdAsArray = sanitizedOrcId.split('-').slice(-1 * 4);
        this.orcId.map((id, index) => (id.part = orcIdAsArray[index]));
      }
      this.profile.orcId = this.orcId;
      this.formData = this.profile;
    },

    async saveProfile() {
      this.v$.formData.$touch();
      if (!this.v$.$invalid) {
        this.submit();
      }
    },

    async submit() {
      this.loading = true;
      const loadingComponent = this.$oruga.loading.open();
      const [foundRelated] = this.institutions.filter(
        (institution) => institution.name === this.formData.relatedInstitutionName,
      );

      const [foundCountry] = countries.filter(
        (country) => country.name === this.formData.nationality,
      );

      const [foundOtherCountry] = countries.filter(
        (country) => country.name === this.formData.countryOtherInstitution,
      );

      const relatedInstitutionId = foundRelated ? foundRelated.id : null;

      const nationality = foundCountry ? foundCountry.name : null;

      const countryOtherInstitution = foundOtherCountry ? foundOtherCountry.name : null;

      const payload = {
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        gender: this.formData.gender,
        birthDate: `${this.birthDate.year.value}-${this.birthDate.month.value}-${this.birthDate.day.value}`,
        orcId: this.parseOrcId(this.formData.orcId),
        relatedInstitutionId,
        nationality,
        homeInstitutionId: this.formData.homeInstitutionName,
        countryOtherInstitution,
      };

      await updateUserProfile(payload);
      setTimeout(async () => {
        const response = await getUserProfile();
        this.profile = response.data;
        setProfile(this.profile);
        this.editable = false;
        this.loading = false;
        loadingComponent.close();
      }, 1000);
    },

    async cancel() {
      this.editable = false;
    },

    keyup(event, maxlength) {
      if (event.keyCode !== 9 && event.target.value.length === maxlength) {
        if (event.target.parentNode.nextElementSibling) {
          event.target.parentNode.nextElementSibling.firstChild.focus();
        }
      }
    },
    sanitizeOrcId(id) {
      return sanitizeOrcId(id);
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-form {
  display: flex;
  flex-flow: column;
}
.profile-view {
  display: flex;
  flex-flow: column;
  .profile-view-row {
    display: flex;
    height: 2.5em;
    margin-bottom: 1em;
    span:first-child {
      flex: 1;
      text-align: right;
      margin: 0 1.5em;
    }
    span:last-child {
      flex: 3;
    }
  }
}
.multiple-inputs {
  display: flex;
  flex-flow: row wrap;

  .single-input {
    display: flex;
    flex-direction: column;

    label {
      margin-left: 7px;
      margin-bottom: 3px;
      font-size: 0.6em;
      font-weight: bold;
    }
    input {
      margin-left: 5px;
      &.is-danger {
        border: 1px solid $danger;
      }
    }
    &:first-child {
      input,
      label {
        margin-left: 0;
      }
    }
  }
}

.is-3 {
  width: 25%;
}
.is-4 {
  width: 33%;
}
.is-6 {
  width: 50%;
}
.is-9 {
  width: 75%;
}
.action-bar .container {
  justify-content: flex-end;
}
.action-btns {
  justify-content: flex-end;
  .button {
    margin-left: 1em;
  }
}
.user-roles {
  border-top: 1px solid $grey;
  padding-top: 1em;
}
</style>

<style>
.cancelButton {
  border-color: #dbdbdb;
  color: #363636;
}

.cancelButton:hover {
  border-color: #dbdbdb;
  color: #363636;
  background-color: white;
}
</style>
