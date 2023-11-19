import { useLocalStorage } from '@vueuse/core';
import merge from 'lodash/merge';
import { defineStore } from 'pinia';
import { ref } from 'vue';


export const useMiscStore = defineStore('miscstore', {
    state: () => {

        const craftingState = ref(useLocalStorage('craftingState', {
            listUntranslated: false,
            listChance: false,
            simpleView: true,
            searchTerm: '',
        }, {
            mergeDefaults: (storage, defaults) => merge(defaults, storage)
        }))

        return { craftingState }
    }

})
