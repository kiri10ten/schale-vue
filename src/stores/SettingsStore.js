import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { merge } from 'lodash'

export const useSettingsStore = defineStore('settingsstore', () => {
    const settings = ref(useLocalStorage('settings', {
        language: 'en',
        server: 0,
        theme: 'auto',
        highcontrast: false,
        preferredUnits: 'metric',
        distanceUnit: 'raw',
        durationUnit: 'seconds',
        collectionPerServer: true,
    }, {
        mergeDefaults: (storage, defaults) => merge(defaults, storage)
    }))
           
    return { settings }
})
