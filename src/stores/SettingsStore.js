import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settingsstore', () => {
    const settings = ref(useLocalStorage('settings', {
        language: 'en',
        server: 0,
        theme: 'auto',
        highcontrast: false
    }))
           
    return { settings }
})
