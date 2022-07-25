<template>
  <div v-if="addressFound" class="map">
    <l-map :options="mapOptions" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-marker :lat-lng="center" />
    </l-map>
  </div>
  <div v-else class="loading">
    <spinner v-if="loading" />
  </div>
</template>

<script>
/* eslint-disable global-require */
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import L from 'leaflet';
import Spinner from '@/modules/core/components/ui/Spinner';
import { fetchAddress } from '@/services/apiService';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default {
  components: {
    Spinner,
    LMap,
    LTileLayer,
    LMarker
  },

  props: {
    street: String,
    number: [String, Number],
    zip: String,
    city: String
  },

  data() {
    return {
      addressFound: false,
      loading: true,
      mapOptions: {
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true
      },
      zoom: 17,
      center: L.latLng(47.41322, -1.219482),
      url: '//{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="//osm.org/copyright">OpenStreetMap</a> contributors'
    };
  },

  created() {
    this.getAddress();
  },

  methods: {
    async getAddress() {
      try {
        const addr = `${this.zip} ${this.city} ${this.street} ${this.number || ''}`;
        const response = await fetchAddress(addr);
        const { data } = response;
        const [address] = data;
        if (address) {
          this.addressFound = true;
          this.center = L.latLng(address.lat, address.lon);
        } else {
          this.addressFound = false;
          this.loading = false;
        }
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~leaflet/dist/leaflet.css';

.map {
  position: relative;
  height: 250px;
  flex: 1;
  border-top: 1px solid $grey-medium;
  padding-top: 1em;
}
.loading {
  position: relative;
  margin-left: 25px;
}
</style>
