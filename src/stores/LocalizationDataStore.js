import { defineStore } from 'pinia'
import { useSettingsStore } from './SettingsStore'

export const useLocalizationDataStore = defineStore('localizationdatastore', {
    state: () => ({
        data: {},
    }),
    actions: {
        async fetchData() {
            const lang = useSettingsStore().settings.language;

            return fetch(`/data/${lang}/localization.json`)
            .then((response) => response.json())
            .then((json) => {
                this.data = json
            })
        }
    }
})