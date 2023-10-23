<script setup>
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ItemList from '../components/item/ItemList.vue';
import ItemRender from '../components/item/ItemRender.vue';
import { getEquipmentById } from '../composables/Equipment';
import { getFurnitureById } from '../composables/Furniture';
import { getItemById } from '../composables/Items';
import { translateUi } from '../composables/Localization';
import { setBackground } from '../composables/Utilities';

const route = useRoute();

const renderItem = computed(() => {
    let item;
    switch (route.name) {
        case 'itemview':
            item = getItemById(route.params.itemid);
            document.title = `${item?.Name ?? 'Items'} | Schale`;
            return { item: item, type: 'item'};
        case 'furnitureview':
            item = getFurnitureById(route.params.furnitureid);
            document.title = `${item?.Name ?? 'Furniture'} | Schale`;
            return { item: item, type: 'furniture'};
        case 'equipmentview':
            item = getEquipmentById(route.params.equipmentid);
            document.title = `${item?.Name ?? 'Equipment'} | Schale`;
            return { item: item, type: 'equipment'};
    }
});

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const hideItemList = breakpoints.smaller('lg');

setBackground('BG_MainOffice_Night2.jpg');

</script>

<template>

<div class="container-fluid mt-md-3" :class="{'g-0': hideItemList}">
    <div class="d-flex gap-3">
        <div v-if="!hideItemList || !renderItem.item" class="ba-page flex-fill">
            <ItemList sidebar-mode></ItemList>
        </div>
        <div v-if="renderItem.item" class="item-page" :class="{'ba-page': !hideItemList}">

            <div v-if="hideItemList" class="navigation-buttons d-flex p-2">
                <RouterLink tag="button" class="btn-pill" :to="{name: `${renderItem.type}listview`}">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="ms-2"/>
                    <span class="label">{{ translateUi(renderItem.type) }}</span>
                </RouterLink>
            </div>

            <div class="" id="ba-item-info">
                <ItemRender v-bind="renderItem"></ItemRender>

            </div>
        </div>
    </div>
</div>

</template>

<style scoped lang="scss">

@import '../styles/_mixins.scss';

.navigation-buttons {

    button, a {

        height: 36px;
        padding-left: 0.5rem;
        padding-right: 0.5rem;

        @include backdrop-filter(var(--var-glass-filter-navbar));

        background-color: var(--col-theme-glass);

        &:focus {
            background-color: var(--col-btn-secondary);
        }
    
        &:hover {
            background-color: var(--col-btn-secondary);
        }
    
        &.active {
            background-color: var(--col-btn-active-secondary);
        }    
    }
}

.item-page {

    width: 100%;

    @include lg-up {
        width: 840px;
    }

}

</style>