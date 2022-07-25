<template>
  <div class="columns">
    <div class="column">
      <dl>
        <dt>{{ $t('institution.name') }}:</dt>
        <dd>{{ institution.name }}</dd>
        <dt>{{ $t('institution.cetaf') }}:</dt>
        <dd>
          <a :href="institution.cetaf" target="blank">{{ institution.cetaf }}</a>
        </dd>
        <dt>Description:</dt>
        <dd>{{ val.description.value }}</dd>
      </dl>
      <h3 class="header">Main Address</h3>
      <dl>
        <dt>Address:</dt>
        <dd>{{ val.street.value }} {{ val.number.value }}</dd>
        <dt></dt>
        <dd>{{ val.zipCode.value }} {{ val.city.value }}</dd>
        <dt></dt>
        <dd>{{ val.country.value[0] }}</dd>
      </dl>

      <div v-for="(address, index) in affiliated" :key="index" :class="{ 'extra-address': index !== 0 }">
        <h3 v-if="index === 0 && address.street" class="header">Affiliated addresses</h3>
        <dl v-if="address.street">
          <dt>Address:</dt>
          <dd>{{ address.name }}</dd>
          <dt></dt>
          <dd>{{ address.street }} {{ address.number }}</dd>
          <dt></dt>
          <dd>{{ address.zipcode }} {{ address.city }}</dd>
          <dt></dt>
          <dd>{{ val.country[0] }}</dd>
        </dl>
      </div>
      <h3 class="header">{{ $t('institution.coordinators') }}</h3>
      <dl v-for="(coordinator, i) in uniqueCoordinators" :key="coordinator.email + i" :class="{ coordinator: i }">
        <dt>{{ $t('profile.name') }}:</dt>
        <dd>{{ coordinator.firstName }} {{ coordinator.lastName }}</dd>
        <dt>{{ $t('profile.email') }}:</dt>
        <dd>{{ coordinator.email }}</dd>
      </dl>
    </div>
    <div class="column institute">
      <div class="institute-details">
        <div v-if="getLogo(institution.id)" class="logo-wrapper">
          <div class="logo">
            <img :src="getLogo(institution.id)" :alt="institution.name" />
          </div>
        </div>
        <h3 v-else class="institute-title">{{ institution.name }}</h3>
      </div>
      <div class="map-container">
        <location-map
          :street="institution.fieldValues.street.value"
          :number="institution.fieldValues.number.value"
          :zip="institution.fieldValues.zipCode.value"
          :city="institution.fieldValues.city.value"
        />
      </div>
    </div>
  </div>
</template>

<script>
import LocationMap from '@/modules/core/components/ui/LocationMap';
export default {
  components: {
    LocationMap
  },

  props: {
    institution: {
      type: [Object, Array]
    }
  },

  computed: {
    val() {
      return this.institution.fieldValues;
    },

    affiliated() {
      return Object.values(this.val.aff_address).map(addr => {
        Object.keys(addr).map(key => {
          addr[key] = addr[key]?.value;
        });
        return addr;
      });
    },

    uniqueCoordinators() {
      return this.institution.coordinators.filter(
        (coordinator, index, self) => index === self.findIndex(t => t.email === coordinator.email)
      );
    }
  },

  methods: {
    getLogo(id) {
      try {
        const logoos = require.context('@/assets/images/institutions', true, /^.*\.(png|svg|jpg|jpeg)$/);
        const [logoWithExt] = logoos.keys().filter(rx => rx.match(id));
        const logo = logoWithExt.split('.').splice(1);
        // eslint-disable-next-line global-require
        return require(`@/assets/images/institutions${logo.join('.')}`);
      } catch {
        return '';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  background: $yellow;
  padding: 0.4em 0.8em;
  margin: 1em 0;
}
.extra-address {
  border-top: 1px solid $grey;
  padding-top: 0.8em;
}
.coordinator {
  border-top: 1px solid $grey;
  margin-top: 1em;
}

.institute {
  display: flex;
  align-items: center;
  flex-flow: column nowrap;
  background: $grey-xlight;
  flex: 0 1 300px;
  .logo-wrapper {
    background: $white;
    width: 100%;
    padding: 10px;
    display: flex;
    margin-bottom: 1em;
    justify-content: center;
  }
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 150px;
    text-align: center;
    img {
      max-height: 150px;
    }
    &.circular {
      height: 100px;
      width: 100px;
      border-radius: 50%;
    }
  }
  .institute-title {
    margin: 1em 0;
    text-align: center;
  }
  .institute-details {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    width: 100%;
  }
  .address {
    font-size: 13px;
    margin-bottom: 1em;
    text-align: center;
  }
}
.map-container {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  align-items: flex-start;
  height: 250px;
  position: relative;
  width: 100%;
  padding-top: 1em;
  margin-top: 1em;
}
</style>
