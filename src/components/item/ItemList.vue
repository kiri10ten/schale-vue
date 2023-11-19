<script setup>
import { breakpointsBootstrapV5, useBreakpoints, useElementSize, useMediaQuery } from '@vueuse/core';
import { computed, nextTick, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';
import { RecycleScroller } from 'vue-virtual-scroller';
import { equipmentMap } from '../../composables/Equipment';
import { furnitureMap } from '../../composables/Furniture';
import { itemMap } from '../../composables/Items';
import { translateUi } from '../../composables/Localization';
import { useItemStore } from '../../stores/ItemStore';
import { useSettingsStore } from '../../stores/SettingsStore';
import ListSort from '../common/ListSort.vue';
import ItemCard from './ItemCard.vue';
import ItemListFilters from './ItemListFilters.vue';

const props = defineProps({
    sidebarMode: Boolean
})

const settings = useSettingsStore().settings;
const itemStore = useItemStore();

const scrollerKey = ref(1);

const sortOptions = [
    {key: 'Id', label: translateUi('default'), type: 'number'},
    {key: 'Name', label: translateUi('name'), type: 'string'},
    {key: 'Rarity', label: translateUi('rarity'), type: 'string'},
    {
        key: 'CraftQuality',
        sortOrderFunc: (item) => {
            return item.CraftQuality ?? 0;
        },
        label: translateUi('craft_quality'),
        type: 'number'
    },
    {
        key: 'ShiftingCraftQuality',
        sortOrderFunc: (item) => {
            return item.ShiftingCraftQuality?.[settings.server] ?? 0;
        },
        label: translateUi('shifting_craft_quality'),
        type: 'number'
    },
    {
        key: 'Comfort',
        sortOrderFunc: (item) => {
            return item.ComfortBonus ?? 0;
        },
        label: translateUi('comfort'),
        type: 'number'
    },
    {
        key: 'FurnitureSet',
        sortOrderFunc: (item) => {
            return item.SetGroupId ?? 0;
        },
        label: translateUi('furniture_set'),
        type: 'number'
    },
    {
        key: 'FurnitureSize',
        sortOrderFunc: (item) => {
            return (item.Size?.[0] ?? 0) * (item.Size?.[1] ?? 0);
        },
        label: translateUi('furniture_size'),
        type: 'number'
    },
    {
        key: 'Tier',
        sortOrderFunc: (item) => {
            return item.Tier ?? 0;
        },
        label: translateUi('equipment_tier'),
        type: 'number'
    },
]

const currentSortOption = computed(() => {
    return sortOptions.find(({key}) => key === itemStore.listSort.SortKey);
})

const route = useRoute();

const { activeTab, searchTerm } = toRefs(itemStore.listFilters);
const tabs = ['item', 'furniture', 'equipment'];

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');
const showSidebarSearch = useMediaQuery('(min-width: 1600px)');
const showSidebarSort = useMediaQuery('(min-width: 1700px)');

const useOffCanvas = computed(() => {
    return mobileView.value || props.sidebarMode
})

const usePageMode = computed(() => {
    return (currentItemId.value == '');
})

const showFloatingSortOption = useMediaQuery('(min-width: 480px)');

// switch (route.name) {
//     case 'itemlistview':
//         activeTab.value = 'item';
//         break;
//     case 'furniturelistview':
//         activeTab.value = 'furniture';
//         break;
//     case 'equipmentlistview':
//         activeTab.value = 'equipment';
//         break;
// }

const currentItemId = computed(() => {
    switch (route.name) {
        case 'itemview':
            return route.params.itemid ?? '';
        case 'furnitureview':
            return route.params.furnitureid ?? '';
        case 'equipmentview':
            return route.params.equipmentid ?? '';
        default:
            return '';
    }
})

const items = computed(() => {
    switch (activeTab.value) {
        case 'item':
            return itemMap;
        case 'furniture':
            return furnitureMap;
        case 'equipment':
            return equipmentMap;
    }
})

const resultItemList = computed(() => {

    const itemList = [];
    const searchTerm = itemStore.listFilters.searchTerm.toLowerCase();

    for (const itemId in items.value) {

        let add = true;

        const item = items.value[itemId];

        if (!item.IsReleased[settings.server]) {
            continue;
        }

        if (searchTerm !== "" && !item.Name.toLowerCase().includes(searchTerm)) {
            continue;
        }

        for (const filterType of ['common', activeTab.value]) {
            for (const key in itemStore.activeFilters[filterType]) {

                let prop;

                if (key == 'Craftable') {
                    prop = item.Craftable[settings.server];
                } else if (key == 'StageDrop') {
                    prop = item.StageDrop[settings.server];
                } else if (key == 'Shop') {
                    prop = item.Shops.some(shop => shop.Released[settings.server]);
                } else if (key == 'FurnitureInteraction') {
                    prop = item.Interaction[settings.server];
                } else {

                    prop = item[key];

                    if (typeof prop === 'boolean') {
                        prop = String(prop);
                    }

                }

                if (!(itemStore.activeFilters[filterType][key].includes(prop))) {
                    add = false
                    break;
                }

            }            
        }

        if (add) {

            let sortOrder = 0;

            if (currentSortOption.value.sortOrderFunc) {
                sortOrder = currentSortOption.value.sortOrderFunc(item);
            } else {
                sortOrder = item[currentSortOption.value.key];
            }

            itemList.push({
                SortOrder: sortOrder,
                Key: activeTab.value + item.Id,
                Id: item.Id,
                Type: activeTab.value,
                Name: item.Name,
                Rarity: item.Rarity,
                Icon: item.Icon,
                Interaction: item.Interaction?.[settings.server],
                Tier: item.Tier
            });
        }

    }

    switch (currentSortOption.value.type) {
        case 'string':
            itemList.sort((a, b) => (a.SortOrder.localeCompare(b.SortOrder)) * itemStore.listSort.Mode);
            break;

        case 'stat':
        itemList.sort((a, b) => (a.SortOrder - b.SortOrder) * (-itemStore.listSort.Mode));
            break;

        default:
        itemList.sort((a, b) => (a.SortOrder - b.SortOrder) * (itemStore.listSort.Mode * (currentSortOption.value.reverseSort ? -1 : 1)));
            break;
    }

    scrollerKey.value = !scrollerKey.value;

    return itemList;

});

const itemListEl = ref(null);
const listWidth = useElementSize(itemListEl).width;

const cardMargin = computed(() => {
    return mobileView.value ? 8 : 12;
})

const cardWidth = computed(() => {
    return mobileView.value ? 76 : 86;
})

const cardHeight = computed(() => {
    return mobileView.value ? 68 : 82;
})

const gridColumns = computed(() => {
    return Math.floor(listWidth.value / (cardWidth.value + cardMargin.value));
})

const gridItemWidth = computed(() => {
    return Math.floor(listWidth.value / gridColumns.value);
})

const scrollToItem = ref(true);

watch(gridColumns, (newVal) => {
    if (scrollToItem.value && newVal != 0) {
        scrollToItem.value = false;
        nextTick().then(() => {scrollToCurrentItem()});
    }
})

watch(currentItemId, (newVal, oldVal) => {
    if (oldVal == "" && newVal != oldVal) {
        scrollToItem.value = true;
    }
}, {flush: 'post'});

function scrollToCurrentItem() {
    const index = resultItemList.value.findIndex(i => i.Id == currentItemId.value);
    if (index !== -1) {
        console.log('scrolling to', index);
        itemListEl.value.scrollToItem(index);
    }
}

</script>

<template>

    <!-- <ItemListFilters v-if="sidebarMode" :sort-options="sortOptions" v-model:active-tab="activeTab" :sidebar-mode="sidebarMode" /> -->
    <div class="d-flex gap-3" :class="{'sidebar': sidebarMode}">
        <ItemListFilters :sort-options="sortOptions" v-model:active-tab="activeTab" :sidebar-mode="sidebarMode" />
        <div class="flex-fill">

            <div v-show="mobileView && !sidebarMode" class="card-overlay p-2 mb-2" style="position: sticky; top: 72px; z-index: 50">
                <div class="d-flex gap-2 align-items-stretch">
                    <button class="btn-pill" data-bs-toggle="offcanvas" data-bs-target="#item-filters">
                        <span class="label"><fa icon="filter" class="me-2" />{{ `${translateUi('filters')}${itemStore.activeFilterCount ? ` (${itemStore.activeFilterCount})` : ''}` }}</span>
                    </button>
                    <input v-if="useOffCanvas"
                    type="search"
                    class="form-control circle px-3"
                    autocomplete="off"
                    v-model="searchTerm"
                    :placeholder="translateUi('search')"
                    style="height:32px;">
                    <ListSort class="ms-auto" v-if="showFloatingSortOption" :sort-options="sortOptions" :sort-option="itemStore.listSort" />
                </div>

            </div>

            <div id="ba-item-list-container" class="mb-3" :class="{'p-2 card': !mobileView, 'screen-height': !usePageMode}">
                <div v-if="sidebarMode" class="card-header d-flex gap-2">
                    <button v-if="useOffCanvas" class="btn-pill px-2" data-bs-toggle="offcanvas" data-bs-target="#item-filters" style="height: 40px;">
                        <span class="label"><fa icon="filter" class="me-2" />{{ `${translateUi('filters')}${itemStore.activeFilterCount ? ` (${itemStore.activeFilterCount})` : ''}` }}</span>
                    </button>
                    <!-- <button class="btn-pill px-2" @click="scrollToCurrentItem">
                        Scroll
                    </button> -->
                    <nav class="nav nav-pills justify-content-center flex-fill no-wrap">
                        <button v-for="tab of tabs" class="nav-link" @click="activeTab = tab" :class="{'active': activeTab == tab}">
                            {{ translateUi(tab) }}
                        </button>
                    </nav>

                    <input type="search"
                    v-if="showSidebarSearch"
                    class="form-control circle px-3"
                    autocomplete="off"
                    v-model="itemStore.listFilters.searchTerm"
                    :placeholder="translateUi('search')"
                    style="height:40px;" />

                    <ListSort v-if="showSidebarSort" :sort-options="sortOptions" :sort-option="itemStore.listSort" />

                </div>

                <div class="d-flex pb-2 card-body" :class="{'px-2': sidebarMode}">
                    <RecycleScroller
                        :page-mode="!sidebarMode"
                        class="w-100"
                        :class="{'scrollbar': sidebarMode}"
                        v-show="resultItemList.length"
                        :items="resultItemList"
                        :grid-items="gridColumns"
                        :item-size="cardHeight + cardMargin"
                        :item-secondary-size="gridItemWidth"
                        v-slot="{ item, index }"
                        ref="itemListEl"
                        :key="scrollerKey"
                        key-field="Key">

                                <!-- <RouterLink :to="`/${item.Type}/${item.Id}`">
                                    #{{ index }}<br />
                                    {{ item.Id }}
                                </RouterLink> -->

                            <div class="item-card-wrapper">
                                <ItemCard :item="item" :width="cardWidth" :height="cardHeight"/>
                            </div>

                    </RecycleScroller>
                    <div class="flex-fill">
                        <p v-show="resultItemList.length == 0" class="text-center py-2 m-0" :class="{card: mobileView && !sidebarMode}">{{ translateUi('no_results') }}</p>
                    </div>
                    
                </div>
                

            </div>            
        </div>

    </div>


</template>

<style scoped lang="scss">

@import '../../styles/_mixins.scss';

.item-card-wrapper {
    display: flex;
    height: 100%;

    .selection-grid-card {
        margin: auto;
    }
}

.scrollbar {
    @include scrollable(scroll);
    overflow-y: scroll !important;
}

.no-wrap {
    flex-wrap: nowrap !important;
}
</style>