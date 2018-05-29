import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

import  VueNativeSock from 'vue-native-websocket';

Vue.use(VueNativeSock, 'ws://' + window.MONITORCONFIG.host + ':' + window.MONITORCONFIG.port, {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 3000,
  format: 'json'
});
Vue.use(Vuetify)

new Vue({
  el: '#app',
  render: h => h(App)
})
