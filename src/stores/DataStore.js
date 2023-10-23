import { defineStore } from 'pinia'
import { useSettingsStore } from './SettingsStore'

export const useDataStore = defineStore('dataStore', {
    state: () => ({
        config: {
            data: {},
            isLangSpecfic: false,
            loaded: false
        },
        students: {
            data: {},
            isLangSpecfic: true,
            loaded: false
        },
        voice: {
            data: {},
            isLangSpecfic: true,
            loaded: false       
        },
        summons: {
            data: {},
            isLangSpecfic: true,
            loaded: false  
        },
        items: {
            data: {},
            isLangSpecfic: true,
            loaded: false
        },
        furniture: {
            data: {},
            isLangSpecfic: true,
            loaded: false
        },
        equipment: {
            data: {},
            isLangSpecfic: true,
            loaded: false
        },
        currency: {
            data: {},
            isLangSpecfic: true,
            loaded: false
        },
        localization: {
            data: {},
            isLangSpecfic: true,
            loaded: false
        }
    }),
    actions: {
        async fetchData(module) {
            
            if (this[module].isLangSpecfic) {

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

            } else {
                if (!this[module].loaded) {

                    console.log('DataStore', `fetching ${module}`)
                    return fetch(`/data/${module}.json`)
                    .then((response) => response.json())
                    .then((json) => {
                        this[module].data = json;
                        this[module].loaded = true;
                    })
    
                } else {
                    return Promise.resolve();
                }
            }


        },
        async ensureData(...modules) {
            return Promise.all(modules.map((module) => this.fetchData(module)));
        }
    }
})