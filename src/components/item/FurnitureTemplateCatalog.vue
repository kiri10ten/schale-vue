<script setup>
import { computed } from 'vue';
import { furnitureData } from '../../composables/Furniture';
import ItemCard from './ItemCard.vue';
import { useSettingsStore } from '../../stores/SettingsStore';
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';

const props = defineProps({
    templateId: Number
});

const settings = useSettingsStore().settings

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');

const cardWidth = computed(() => {
    return mobileView.value ? 76 : 86;
})

const cardHeight = computed(() => {
    return mobileView.value ? 68 : 82;
})

const furnitureList = computed(() => {

    return furnitureData.filter((furniture) => furniture.Templates && furniture.Templates.find((template) => template[0] == props.templateId)).map((furniture) => {
        return {
            item: {
                Id: furniture.Id,
                Type: 'furniture',
                Name: furniture.Name,
                Rarity: furniture.Rarity,
                Icon: furniture.Icon,
                Interaction: furniture.Interaction?.[settings.server]
            },
            amount: '×' + furniture.Templates.find((template) => template[0] == props.templateId)[1]
        }
    });

})

</script>

<template>
    <div class="selection-grid selection-grid-flex stage p-2">
        <ItemCard v-for="furniture in furnitureList" :item="furniture.item" :badge="furniture.amount" :width="cardWidth" :height="cardHeight" no-link></ItemCard>
    </div>
</template>