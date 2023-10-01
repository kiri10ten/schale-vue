<script setup>
import { computed } from 'vue';
import ItemRender from '../components/item/ItemRender.vue';
import { useRoute, useRouter } from 'vue-router';
import { getItemById } from '../composables/Items';
import { getEquipmentById } from '../composables/Equipment';
import { getFurnitureById } from '../composables/Furniture';
import { setBackground } from '../composables/Utilities';

const route = useRoute();
const router = useRouter();

const item = computed(() => {
    switch (route.name) {
        case 'itemview':
            return { item: getItemById(route.params.itemid), type: 'item'};
        case 'furnitureview':
            return { item: getFurnitureById(route.params.furnitureid), type: 'furniture'};
        case 'equipmentview':
            return { item: getEquipmentById(route.params.equipmentid), type: 'equipment'};
    }
});

setBackground('BG_MainOffice_Night2.jpg');

</script>

<template>

<div class="container-xl py-md-3">
    <div class="row">
        <div class="col-12 col-md-6 ba-page">
            <div class="px-0 px-xl-1 sidebar">
                <div id="ba-item-list-container" class="card p-2 screen-height mobile-scroll">
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 ba-page">
            <div class="px-0 ps-xl-3" id="ba-item-info">
                <ItemRender v-bind="item"></ItemRender>

            </div>
        </div>
    </div>
</div>

</template>
