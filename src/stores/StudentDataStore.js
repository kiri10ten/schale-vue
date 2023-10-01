import { defineStore } from 'pinia'
import { useSettingsStore } from './SettingsStore'

export const useStudentDataStore = defineStore('studentdatastore', {
    state: () => ({
        data: {},
        loaded: false
    }),
    actions: {
        async fetchData() {
            const lang = useSettingsStore().settings.language;

            if (this.loaded != lang) {

                return fetch(`/data/${lang}/students.json`)
                .then((response) => response.json())
                .then((json) => {
                    this.data = json;
                    this.loaded = lang;
                })

            } else {
                
            }


        }
    }
})