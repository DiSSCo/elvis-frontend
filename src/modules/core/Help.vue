<template>
  <section class="hero grey-bg">
    <div class="section">
      <div class="container">
        <div class="box">
          <header>
            <h1>{{ $t('help.title') }}</h1>
          </header>
          <p>
            Hello, you have come to the right place for ELViS user support! ELViS users can submit queries about using
            the platform, technical issues with the functionalities and feedback for improvements via the DiSSCo
            helpdesk: <a href="mailto:support@dissco.jitbit.com">support@dissco.jitbit.com</a>.
          </p>
          <header>
            <h1>{{ $t('help.elaboration') }}</h1>
          </header>
          <p>{{ $t('help.sub1') }}</p>
          <p>
            Alternatively, you can register and log into the helpdesk to see all your tickets:
            <a href="https://dissco.jitbit.com/helpdesk/">https://dissco.jitbit.com/helpdesk/</a>
          </p>
          <p>{{ $t('help.sub2') }}</p>
          <header>
            <h1>{{ $t('help.extra_note') }}</h1>
          </header>
          <p>
            To reduce traffic in the helpdesk please check if your query can be solved in the Transnational Access and
            Virtual Access FAQs on the SYNTHESYS+ Website:
            <a href="https://www.synthesys.info/access/virtual-access/Virtual-Access-FAQs.html">VA FAQs</a>
            and
            <a href="https://www.synthesys.info/access/faqs.html">TA FAQs</a>.
          </p>
          <div class="form-container">
            <footer>{{ $t('help.footer') }}</footer>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { sendFeedback } from '@/services/apiService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';

export default {
  components: {
    FieldRow
  },

  data() {
    return {
      form: {
        subject: '',
        message: ''
      },
      uploadErrorMessage: '',
      succesMessage: '',
      loading: false,
      file: null,
      reset: false
    };
  },

  validations: {
    form: {
      subject: {
        required
      },
      message: {
        required
      }
    }
  },

  created() {
    this.$root.$on('fileUploaded', this.fetchFile);
  },

  beforeDestroy() {
    this.$root.$off('fileUploaded');
  },

  methods: {
    fetchFile(file) {
      this.file = file;
    },

    async submit() {
      this.loading = true;
      this.$v.form.$touch();
      if (!this.$v.form.$invalid) {
        const formData = new FormData();
        formData.append('subject', this.form.subject);
        formData.append('message', this.form.message);
        formData.append('attach', this.file);

        try {
          await sendFeedback(formData);
          setTimeout(() => {
            this.loading = false;
            this.succesMessage = 'Your question / feedback is received.';
            this.resetForm();
          }, 1000);
        } catch (error) {
          console.log('error: ', error);
          this.loading = false;
          this.uploadErrorMessage =
            'Something went wrong uploading the form, perhaps your file is too large. Please try again.';
        }
      } else {
        this.loading = false;
      }
    },

    resetForm() {
      this.form.subject = '';
      this.form.message = '';
      this.file = null;
      this.reset = !this.reset;
      this.$v.form.$reset();

      setTimeout(() => {
        this.succesMessage = '';
      }, 5000);
    }
  }
};
</script>

<style lang="scss" scoped>
.form-container {
  border-top: 1px solid $grey;
  padding-top: 2em;
  margin-top: 2em;

  form {
    width: 80%;
    .size-up-to-desktop & {
      width: 100%;
    }
  }
}
.form-btn {
  display: flex;
  justify-content: flex-end;
}

::v-deep i {
  font-size: 18px;
}

.grey-bg {
  background: $grey-xlight;
}
footer {
  font-size: 12px;
  margin-top: 4em;
}
</style>
