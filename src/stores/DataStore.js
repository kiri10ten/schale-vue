import { defineStore } from 'pinia'
import { useSettingsStore } from './SettingsStore'

export const useDataStore = defineStore('dataStore', {
    state: () => ({
        students: {
            data: {},
            loaded: false
        },
        summons: {
            data: {},
            loaded: false  
        },
        items: {
            data: {},
            loaded: false
        },
        furniture: {
            data: {},
            loaded: false
        },
        equipment: {
            data: {},
            loaded: false
        },
        currency: {
            data: {},
            loaded: false
        },
        localization: {
            data: {},
            loaded: false
        }
    }),
    actions: {
        async fetchData(module) {
            const lang = useSettingsStore().settings.language;

            if (this[module].loaded != lang) {

                console.log('DataStore', `fetching ${lang}/${module}`)
                return fetch(`/data/${lang}/${module}.json`)
                .then((response) => response.json())
                .then((json) => {
                    this[module].data = json;
                    this[module].loaded = lang;
                })

            } else {
                return Promise.resolve();
            }

        },
        async ensureData(...modules) {
            return Promise.all(modules.map((module) => this.fetchData(module)));
        }
    }
})