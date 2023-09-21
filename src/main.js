import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import './assets/css/main.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { config } from "@fortawesome/fontawesome-svg-core";

import App from './App.vue'
import router from './router'
import { tooltip } from './utilities/directives'

const app = createApp(App)

library.add(fas)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('fa', FontAwesomeIcon)
config.styleDefault = 'solid';

app.directive('tooltip', tooltip)

app.use(createPinia())
app.use(router)

app.mount('#app')
