<script setup>
import { ref, computed, watch } from 'vue';
import ItemRender from '../components/item/ItemRender.vue';
import { useRoute, useRouter } from 'vue-router';
import { itemMap, getItemById } from '../composables/Items';
import { equipmentMap, getEquipmentById } from '../composables/Equipment';
import { furnitureMap, getFurnitureById } from '../composables/Furniture';
import { setBackground } from '../composables/Utilities';
import ItemCard from '../components/item/ItemCard.vue';
import { translateUi } from '../composables/Localization';
import { RecycleScroller } from 'vue-virtual-scroller'
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';
import ItemList from '../components/item/ItemList.vue';

const route = useRoute();

switch (route.name) {
    case 'itemlistview':
        document.title = `${translateUi('item')} | Schale`;
        break;
    case 'furniturelistview':
        document.title = `${translateUi('furniture')} | Schale`;
        break;
    case 'equipmentlistview':
        document.title = `${translateUi('equipment')} | Schale`;
        break;
}

const breakpoints = useBreakpoints(breakpointsBootstrapV5);

setBackground('BG_MainOffice_Night2.jpg');

</script>

<template>

    <div class="container-fluid mt-3">
        <ItemList />
    </div>

</template>

<style scoped lang="scss">

@import '../styles/_mixins.scss';

.item-page {
    width: 840px;
}

</style>