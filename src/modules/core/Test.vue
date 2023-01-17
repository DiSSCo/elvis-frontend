<template>
  <section class="hero grey-bg">
    <div class="section">
      <div class="container">
        <div class="columns">
          <div class="column">
            <div class="box">
              <header>
                <h1>{{ $t('registration.register') }}</h1>
              </header>
              <div class="thank-you" :class="{ hidden: !showThankYou }">
                <p>{{ $t('registration.thank_you') }}</p>
              </div>
              <form @submit.prevent :class="{ hidden: showThankYou }" class="registration-form">
                <component
                  v-for="(field, index) in fields"
                  :is="field.type"
                  :key="field.id"
                  :value="form[field.id]"
                  :path="[field.id]"
                  :context="{ resource: 'register' }"
                  :label="$t(field.label)"
                  v-bind="{ ...field.options }"
                  :style="{ order: index * 2 }"
                  :tabindex="index * 2"
                />

                <field-row
                  :label="$t('profile.birthday')"
                  :fieldOptions="{
                    validation: v$.form.birthday,
                    errorMessage: `Please enter a valid date of birth`
                  }"
                  :style="{ order: 5 }"
                >
                  <div class="multiple-inputs is-6">
                    <div v-for="(part, index) of form.birthday" :key="index" class="single-input is-4">
                      <input
                        type="text"
                        v-model.trim="part.value"
                        @blur="v$.form.birthday[index].$touch()"
                        ref="birthday"
                        tabindex="5"
                        :maxlength="part.maxLength"
                        :placeholder="part.placeHolder"
                        :class="{ 'is-danger': v$.form.birthday[index].$dirty && v$.form.birthday[index].$error }"
                      />
                    </div>
                  </div>
                </field-row>

                <field-row
                  :label="$t('profile.orcid')"
                  :fieldOptions="{
                    validation: v$.form.orcId,
                    errorMessage: `Please enter a valid ${$t('profile.orcid')}`,
                    tooltip: `The ${$t(
                      'profile.orcid'
                    )} is a code to uniquely identify people that create, add to, or use scientific material. You can get an ${$t(
                      'profile.orcid'
                    )} for free here: https://orcid.org. We require this as we want to connect results from the virtual access with people and publications in the future.`
                  }"
                  :style="{ order: 7 }"
                >
                  <div class="multiple-inputs">
                    <div v-for="(id, index) of form.orcId" :key="index" class="single-input is-3">
                      <input
                        type="text"
                        v-model.trim="id.part"
                        @blur="index === form.orcId.length - 1 ? v$.form.orcId.$touch() : null"
                        @keyup="keyup($event, 4)"
                        maxlength="4"
                        ref="orcId"
                        tabindex="5"
                      />
                    </div>
                  </div>
                </field-row>

                <div class="form-btn" :style="{ order: 20 }">
                  <field-row
                    field="CheckboxField"
                    path="agreement"
                    label="I agree with the Privacy Statement"
                    :showLabel="false"
                  />

                  <o-button :loading="loading" variant="primary" @click.prevent="register" :disabled="disabled">{{
                    $t('registration.register')
                  }}</o-button>
                </div>
                <div v-if="message.text" class="response-message" :style="{ order: 21 }">
                  <o-message :type="message.type" has-icon>{{ message.text }}</o-message>
                </div>
                <div class="is-size-7" :style="{ order: 22 }">
                  (Here you can read the <a href="#" @click="showPrivacyStatement = true">Privacy Statement</a>)
                </div>
              </form>
            </div>
          </div>

          <div class="column is-6">
            <div class="box">
              <header>
                <h1>{{ $t('registration.steps') }}</h1>
              </header>
              <ul class="registration-steps">
                <li><span class="step">1</span>{{ $t('registration.step1') }}</li>
                <li><span class="step">2</span>{{ $t('registration.step2') }}</li>
                <li><span class="step last">3</span>{{ $t('registration.step3') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <o-modal :active.sync="showPrivacyStatement">
      <PrivacyStatement />
    </o-modal>
  </section>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import {
  required,
  email,
  sameAs,
  maxLength,
  minLength,
  minValue,
  maxValue,
  numeric,
} from '@vuelidate/validators';
import { checkIfUserExists, createNewUser } from '@/services/usersService';
import { fetchInstitutionsNoToken } from '@/services/institutionsService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import countries from '@/modules/core/schemas/country-list.json';
import fields from './schemas/register.json';

export default {
  components: {
    FieldRow,
    PrivacyStatement: () => import('./PrivacyStatement.vue'),
  },
  watch: {
    'v$.form.email': {
      handler(value) {
        const emailField = this.fields.find((field) => field.id === 'email');
        emailField.options.fieldOptions.errorMessage = !value /* .required */
          ? 'Please enter an email address'
          : !value.email
            ? 'Please enter a valid email address'
            : this.emailExists
              ? 'User with the specified address already exists'
              : '';
      },
      immediate: true,
      deep: true,
    },
    'v$.form.password': {
      handler(value) {
        const passwordField = this.fields.find((field) => field.id === 'password');
        passwordField.options.fieldOptions.errorMessage = !value /* .required */
          ?'Please enter a password'
          : value.required && !value.strength
            ? 'Password is too weak. Please check the rules under the (i)'
            : '';
      },
      immediate: true,
      deep: true,
    },
  },

  setup() {
    return { v$: useVuelidate() };
  },

  data() {
    return {
      fields: fields.data,
      form: {
        gender: 'other',
        firstName: '',
        lastName: '',
        birthday: {
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
        email: '',
        institution: '',
        nationality: '',
        countryOtherInstitution: '',
        password: '',
        passWordVerified: '',
      },
      message: {
        type: '',
        text: '',
      },
      emailExists: false,
      loading: false,
      showThankYou: false,
      disabled: true,
      showPrivacyStatement: false,
      institutions: null,
    };
  },
  validations: {
    form: {
      firstName: {
        required,
      },
      lastName: {
        required,
      },
      birthday: {
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
      email: {
        required,
        email,
        async exists(value) {
          if (!value) return true;
          const response = await checkIfUserExists(value);
          this.emailExists = !!response.data.exists;
          return !response.data.exists;
        },
      },
      password: {
        required,
        strength: (password) =>
          password.length >= 8
          && password.length < 20
          && /[a-z]/.test(password)
          && /[A-Z]/.test(password)
          && /[0-9]/.test(password),
      },
      passWordVerified: {
        required,
        sameAsPassword: sameAs('password'),
      },
    },
  },
  created() {
    this.emitter.on('updateField', this.handleFormField);
    this.setFields();
  },
  unmounted() {
    this.emitter.off('updateField');
    this.showThankYou = false;
  },
  methods: {
    async setFields() {
      const response = await fetchInstitutionsNoToken();
      this.institutions = response.data.data;
      this.fields = this.fields.map(field => {
        if (field.options.fieldOptions?.errorMessage) {
          field.options.fieldOptions.validation = this.v$.form[field.id];
        }
        if (field.id === 'institution') {
          field.options.fieldOptions.options = this.institutions.map(inst => inst.name).sort();
        }
        if (field.id === 'nationality') {
          field.options.fieldOptions.options = countries.map(country => country.name).sort();
        }
        if (field.id === 'countryOtherInstitution') {
          field.options.fieldOptions.options = countries.map(country => country.name).sort();
        }
        return field;
      });
    },
    handleFormField(event) {
      this.form[event.fieldId] = event.value.value;
      if (event.fieldId && event.fieldId === 'agreement') {
        this.disabled = !event.value.value;
      }
    },
    async register() {
      this.v$.form.$touch();
      if (!this.v$.$invalid) {
        this.createUser();
      }
    },
    async createUser() {
      this.loading = true;
      let orcId = 'https://orcid.org/';
      this.form.orcId.forEach((id, index) => {
        orcId += index ? `-${id.part}` : id.part;
      });
      const birthDate = `${this.form.birthday.year.value}-${this.form.birthday.month.value}-${this.form.birthday.day.value}`;
      const relatedInstitutionId = this.form.institution
        ? this.institutions.find(institution => institution.name === this.form.institution).id
        : null;
      const nationality = this.form.nationality
        ? countries.find(country => country.name === this.form.nationality).name
        : null;
      const countryOtherInstitution = this.form.countryOtherInstitution
        ? countries.find(country => country.name === this.form.countryOtherInstitution).name
        : null;
      const newUser = {
        gender: this.form.gender.toLowerCase(),
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        birthDate,
        relatedInstitutionId,
        email: this.form.email.toLowerCase(),
        password: this.form.password,
        orcId,
        nationality,
        homeInstitutionId: this.form.homeInstitutionName,
        countryOtherInstitution,
      };
      try {
        const response = await createNewUser(newUser);
        if (response) {
          setTimeout(() => {
            this.showThankYou = true;
            this.loading = false;
          }, 1000);
        }
      } catch (error) {
        this.loading = false;
        this.message.type = 'is-danger';
        this.message.text = error.response.data?.data?.email
          || error.response.data?.description || 'Something went wrong';
      }
    },
    keyup(event, maxlength) {
      if (event.target.value.length === maxlength) {
        if (event.target.parentNode.nextElementSibling) {
          event.target.parentNode.nextElementSibling.firstChild.focus();
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.registration-form {
  display: flex;
  flex-flow: column;
}
.form-btn {
  margin-top: 3em;
  display: flex;
  justify-content: space-between;
}
.column {
  display: flex;
  .box {
    flex: 1;
  }
}
.registration-steps {
  display: flex;
  flex-flow: column nowrap;
  li {
    display: flex;
    align-items: flex-start;
    padding-bottom: 20px;
    overflow: hidden;
  }
}
.step {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  min-width: 30px;
  height: 30px;
  background: $primary;
  border-radius: 50%;
  color: $white;
  margin-right: 1em;
  font-weight: 600;
  font-family: $font-family-secondary;
  &.last:after {
    content: '';
    width: 0;
    height: 0;
    background: none;
  }
  &:after {
    content: '';
    width: 4px;
    height: 200px;
    background: $primary;
    position: absolute;
    bottom: -200px;
    left: 13px;
  }
  .response-message {
    display: flex;
    justify-content: center;
  }
}
:deep(i) {
  font-size: 18px;
}
:deep(.media) {
  display: flex;
  align-items: center;
}
.grey-bg {
  background: $grey-xlight;
}
:deep(.is-blue) {
  color: $blue;
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
.hidden {
  opacity: 0;
  visibility: hidden;
  transition: all 0.5s;
}
.thank-you {
  position: absolute;
}
</style>
