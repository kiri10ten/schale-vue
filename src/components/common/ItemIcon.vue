<script setup>
import { computed } from 'vue';
import { getItemById } from '../../composables/Items';
import { getCurrencyById } from '../../composables/Currency';
import { getEquipmentById } from '../../composables/Equipment';
import { getFurnitureById } from '../../composables/Furniture';

import Tooltip from './Tooltip.vue';
import { translate, translateUi } from '../../composables/Localization';


const props = defineProps({
    itemType: String,
    itemId: Number,
    item: Object,
    primaryLabel: String,
    secondaryLabel: String,
    iconLabel: String
});

const iconPath = computed(() => {return props.itemType.toLowerCase() == 'currency' ? 'item' : props.itemType.toLowerCase()});

const renderItem = computed(() => {
    if (props.item) {
        return props.item;
    } else {
        switch (props.itemType.toLowerCase()) {
            case 'item':
                return getItemById(props.itemId);
            case 'furniture':
                return getFurnitureById(props.itemId);
            case 'currency':
                return getCurrencyById(props.itemId);
            case 'equipment':
                return getEquipmentById(props.itemId);
        }
    }
});

const tooltip = computed(() => {
    return {
        title: renderItem.value.Name,
        subtitle: translate('ItemCategory', renderItem.value.SubCategory ?? renderItem.value.Category) ?? translate('ItemCategory', props.itemType),
        rarity: renderItem.value.Rarity,
        icon: `/images/${iconPath.value}/icon/${renderItem.value.Icon}.webp`,
        body: renderItem.value.Desc,
        iconClass: 'img-scale-larger'
    }
});

</script>

<template>
    <component :is="itemType.toLowerCase() == 'currency' ? 'div' : 'RouterLink'" :to="{name: itemType.toLowerCase() + 'view', params: { [itemType.toLowerCase() + 'id']: renderItem.Id }}">
        <Tooltip v-bind="tooltip" class="item-drop drop-shadow position-relative">
            <img class="ba-item-icon" :class="{[`ba-item-${renderItem.Rarity?.toLowerCase()}`]: true, ['mb-0']: !primaryLabel && !iconLabel}" :src="`/images/${iconPath}/icon/${renderItem.Icon}.webp`" :alt="renderItem.Name">
            <span v-if="primaryLabel" class="ba-material-label">{{ primaryLabel }}</span>
            <span v-if="secondaryLabel" class="label-droptype">{{ secondaryLabel }}</span>
            <img v-if="iconLabel" class="ba-favor-label" :src="iconLabel">
        </Tooltip>
    </component>

</template>