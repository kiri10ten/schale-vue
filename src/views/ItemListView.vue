<script setup>
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';
import { useRoute } from 'vue-router';
import ItemList from '../components/item/ItemList.vue';
import { translateUi } from '../composables/Localization';
import { setBackground, setPageTitle } from '../composables/Utilities';

const route = useRoute();

switch (route.name) {
    case 'itemlistview':
        setPageTitle(translateUi('item'));
        break;
    case 'furniturelistview':
        setPageTitle(translateUi('furniture'));
        break;
    case 'equipmentlistview':
        setPageTitle(translateUi('equipment'));
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