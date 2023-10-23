<script setup>
import { computed, toRefs } from 'vue';
import { useItemStore } from '../../stores/ItemStore';
import ListSort from '../common/ListSort.vue';
import { translate, translateUi } from '../../composables/Localization';
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';

const props = defineProps({
    activeTab: String,
    sidebarMode: Boolean,
    sortOptions: Array
})

const tabs = ['item', 'furniture', 'equipment'];

const emit = defineEmits(['update:activeTab']);

const activeTab = computed({
  get() {
    return props.activeTab;
  },
  set(value) {
    emit('update:activeTab', value);
  }
})

const itemStore = useItemStore();
const { filters } = toRefs(useItemStore().listFilters)

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');

const offCanvas = computed(() => {
    return props.sidebarMode || mobileView.value;
})

const filtersClass = computed(() => {
    return offCanvas.value ? 'h-100' : 'card sidebar';
})

</script>

<template>

<Teleport to="body" :disabled="!sidebarMode" >

    <div id="item-filters" class="item-filters offcanvas-start" :class="{'offcanvas': sidebarMode, 'offcanvas-md': !sidebarMode}">
        <div :class="filtersClass">

            <div class="p-2 d-flex flex-column gap-2" :class="{'screen-height': !offCanvas, 'h-100': offCanvas}">
                <div v-show="offCanvas">
                    <div class="d-flex align-items-center p-1">
                        <h3 class="text-bold m-0">{{ translateUi('filters') }}</h3>
                        <button class="btn-close ms-auto" data-bs-dismiss="offcanvas" data-bs-target="#item-filters"></button>
                    </div>
                </div>

                <div class="d-flex gap-2 p-1">
                    <input type="search"
                    class="form-control circle px-3"
                    autocomplete="off"
                    v-model="itemStore.listFilters.searchTerm"
                    :placeholder="translateUi('search')"
                    style="height:40px;">

                <ListSort :sort-options="sortOptions" :sort-option="itemStore.listSort" />
                </div>
                <div class="list-filters flex-fill p-1">
                    <nav v-if="!sidebarMode" class="nav nav-pills justify-content-center mb-2">
                        <button v-for="tab of tabs" class="nav-link" @click="activeTab = tab" :class="{'active': activeTab == tab}">
                            {{ translateUi(tab) }}
                        </button>
                    </nav>
                    <div class="search-filter-group-list">
                        <div>
                            <h5>{{ translateUi('category') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters[activeTab].Category"
                                class="btn-pill"
                                :class="{active: value}"
                                @click="filters[activeTab].Category[key] = !filters[activeTab].Category[key]"
                                >
                                    <span class="label">{{ translate('ItemCategory', key)}}</span>
                                </button>
                            </div>
                        </div>
                        <div v-if="activeTab !== 'equipment'">
                            <h5>{{ translateUi('subcategory') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters[activeTab].SubCategory"
                                class="btn-pill"
                                :class="{active: value}"
                                @click="filters[activeTab].SubCategory[key] = !filters[activeTab].SubCategory[key]"
                                >
                                    <span class="label">{{ translate('ItemCategory', key)}}</span>
                                </button>
                            </div>
                        </div>
                        <div v-if="activeTab == 'furniture'">
                            <h5>{{ translateUi('furniture_set') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters.furniture.SetGroupId"
                                class="btn-pill"
                                :class="{active: value}"
                                @click="filters.furniture.SetGroupId[key] = !filters.furniture.SetGroupId[key]"
                                >
                                    <span class="label">{{ translate('FurnitureSet', key) }}</span>
                                </button>
                            </div>
                        </div>
                        <div v-if="activeTab == 'equipment'">
                            <h5>{{ translateUi('equipment_tier') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters.equipment.Tier"
                                class="btn-pill"
                                :class="{active: value}"
                                @click="filters.equipment.Tier[key] = !filters.equipment.Tier[key]"
                                >
                                    <span class="label">T{{ key }}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('rarity') }}</h5>
                            <div class="search-filter-group">

                                <button v-for="(value, key) in filters.common.Rarity"
                                class="btn-pill"
                                :class="{active: value}"
                                @click="filters.common.Rarity[key] = !filters.common.Rarity[key]"
                                >
                                    <span class="label">
                                        <fa icon="circle" class="me-2" :class="`col-item-${key.toLowerCase()}`" />
                                        {{ key }}
                                    </span>
                                </button>

                            </div>
                        </div>
                        <div v-if="activeTab != 'equipment'">
                            <h5>{{ translateUi('misc') }}</h5>
                            <div class="search-filter-group">
                                <button
                                class="btn-pill"
                                :class="{active: filters.common.Craftable}"
                                @click="filters.common.Craftable = !filters.common.Craftable"
                                >
                                    <span class="label">{{ translateUi('craftable') }}</span>
                                </button>
                                <button
                                v-if="activeTab == 'item'"
                                class="btn-pill"
                                :class="{active: filters.item.StageDrop}"
                                @click="filters.item.StageDrop = !filters.item.StageDrop"
                                >
                                    <span class="label">{{ translateUi('stagedrop') }}</span>
                                </button>
                                <button
                                v-if="activeTab == 'item'"
                                class="btn-pill"
                                :class="{active: filters.item.Shop}"
                                @click="filters.item.Shop = !filters.item.Shop"
                                >
                                    <span class="label">{{ translateUi('shop') }}</span>
                                </button>
                                <button
                                v-if="activeTab == 'furniture'"
                                class="btn-pill"
                                :class="{active: filters.furniture.FurnitureInteraction}"
                                @click="filters.furniture.FurnitureInteraction = !filters.furniture.FurnitureInteraction"
                                >
                                    <span class="label-filter">
                                        <img width="22" height="22" :src="'/images/ui/Cafe_Icon_Interaction.png'">
                                        {{ translateUi('furniture_title') }}
                                    </span>
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <div class="d-flex gap-2 p-1">
                    <button class="w-100 btn-pill" :class="{disabled: itemStore.activeFilterCount == 0}" @click="itemStore.clearFilters(activeTab)">
                        <span class="label">
                            <fa icon="filter-circle-xmark" class="me-2" />
                            {{ `Clear ${itemStore.activeFilterCount} filter(s)` }}
                        </span>
                    </button>
                </div>
            </div>

        </div>
    </div>

</Teleport>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.item-filters {

    width: 520px;

    @include md-up {
        width: 380px;
    }

    @include lg-up {
        width: 460px;
    }

    @include xl-up {
        width: 520px;
    }
}

.list-filters {
    @include scrollable(auto);
}

</style>