import { useLocalStorage } from '@vueuse/core';
import merge from 'lodash/merge';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useDataStore } from "./DataStore";


export const useItemStore = defineStore('itemstore', {
    state: () => {

        const listFilterDefaults = {
            common: {
                Rarity: {
                    N: false,
                    R: false,
                    SR: false,
                    SSR: false,
                },
                Craftable: false,
            },
            item: {
                Category: {
                    Material: false,
                    Coin: false,
                    CharacterExpGrowth: false,
                    Favor: false,
                    SecretStone: false,
                    Consumable: false,
                    Collectible: false,
                },
                SubCategory: {
                    Artifact: false,
                    CDItem: false,
                    BookItem: false,
                },
                StageDrop: false,
                Shop: false,
                ShowImmediateUse: false,
                ShowExpired: false,
            },
            furniture: {
                Category: {
                    Furnitures: false,
                    Interiors: false,
                    Decorations: false,
                },
                SubCategory: {
                    Wallpaper: false,
                    Floor: false,
                    Background: false,
                    Table: false,
                    Chair: false,
                    Closet: false,
                    FloorDecoration: false,
                    WallDecoration: false,
                    Prop: false,
                    HomeAppliance: false,
                    Bed: false,
                    FurnitureEtc: false,
                },
                SetGroupId: {
                    0: false
                },
                FurnitureInteraction: false,
            },
            equipment: {
                Category: {
                    Exp: false,
                    WeaponExpGrowth: false,
                    Hat: false,
                    Gloves: false,
                    Shoes: false,
                    Bag: false,
                    Badge: false,
                    Hairpin: false,
                    Charm: false,
                    Necklace: false,
                    Watch: false,
                },
                Tier: {
                }
            }
        }

        const configJp = useDataStore().config.data.Regions[0];

        for (let i = 100; i <= configJp.FurnitureSetMax; i++) {
            listFilterDefaults.furniture.SetGroupId[i] = false;
        }

        for (let i = 1; i <= configJp.EquipmentMaxLevel[0]; i++) {
            listFilterDefaults.equipment.Tier[i] = false;
        }

        const listFilters = ref(useLocalStorage('itemListFilters', {
            activeTab: 'item',
            searchTerm: "",
            filters: listFilterDefaults
        }, {
            mergeDefaults: (storage, defaults) => merge(defaults, storage)
        }))

        const listSort = ref(useLocalStorage('itemListSort', {
            SortKey: 'Id',
            Mode: 1,
        }, {
            mergeDefaults: (storage, defaults) => merge(defaults, storage)
        }))

        return { listFilters, listSort}
    },
    getters: {
        activeFilters: (state) => {
            const activeFilters = {};
            for (const itemType in state.listFilters.filters) {

                activeFilters[itemType] = {};

                for (const key in state.listFilters.filters[itemType]) {
                                
                    if (typeof state.listFilters.filters[itemType][key] === 'object') {
            
                        const filterValues = [];
            
                        for (const val in state.listFilters.filters[itemType][key]) {
                            
                            if (state.listFilters.filters[itemType][key][val] === true) {
                                filterValues.push(isNaN( Number(val) ) ? val : Number(val));
                            }
                        }
            
                        if (filterValues.length) {
                            activeFilters[itemType][key] = filterValues;
                        }
            
                    } else {
            
                        if (state.listFilters.filters[itemType][key] === true) {
                            activeFilters[itemType][key] = [true];
                        }
            
                    }
            
                }
            }

            console.log('filters', activeFilters)
            return activeFilters;
        },
        activeFilterCount() {
            const filters = this.activeFilters;
            return Object.keys(filters.common).length + Object.keys(filters[this.listFilters.activeTab]).length// + (this.listFilters.searchTerm != "" ? 1 : 0)
        }
    },
    actions: {
        clearFilters(...types) {

            //this.listFilters.searchTerm = "";
            for (const itemType of ['common', ...types]) {
                for (const key in this.listFilters.filters[itemType]) {

                    if (typeof this.listFilters.filters[itemType][key] === 'object') {
                        for (const val in this.listFilters.filters[itemType][key]) {
                            this.listFilters.filters[itemType][key][val] = false;
                        }
                    } else {
                        this.listFilters.filters[itemType][key] = false;
                    }

                }
            }
            
        }
    }

})
