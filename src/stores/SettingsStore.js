import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { capitalize, merge } from 'lodash'

export const useSettingsStore = defineStore('settingsstore', {
    state: () => {
        const settings = ref(useLocalStorage('settings', {
            language: 'en',
            server: 0,
            theme: 'auto',
            highcontrast: false,
            backgrounds: true,
            preferredUnits: 'metric',
            distanceUnit: 'raw',
            durationUnit: 'seconds',
            screenMode: 'full',
            collectionPerServer: true,
            showDeveloperProps: false,
        }, {
            mergeDefaults: (storage, defaults) => merge(defaults, storage)
        }))
               
        return { settings }
    },
    getters: {
        languageProp: (state) => capitalize(state.settings.language),
    },
})
