<script setup>
import { computed, ref } from 'vue';
import { getCurrencyById } from '../../composables/Currency';
import { getEquipmentById } from '../../composables/Equipment';
import { getFurnitureById } from '../../composables/Furniture';
import { getGachaGroupById } from '../../composables/GachaGroup';
import { getItemById } from '../../composables/Items';

import { translate, translateUi } from '../../composables/Localization';
import Modal from './Modal.vue';
import Tooltip from './Tooltip.vue';
import { regionSettings } from '../../composables/RegionSettings';


const props = defineProps({
    itemType: String,
    itemId: Number,
    item: Object,
    primaryLabel: String,
    secondaryLabel: String,
    iconLabel: String,
    slide: Number
});

const contentsModal = ref(null);
const tooltipEl = ref(null);

const iconPath = computed(() => {return props.itemType.toLowerCase() == 'currency' ? 'item' : props.itemType.toLowerCase()});

const isGroupItem = computed(() => {
    return props.itemType.toLowerCase() == 'gachagroup';
})

const activeSlide = computed(() => {
    if (groupItems.value.length) {
        return (props.slide % groupItems.value.length);
    } else {
        return 0;
    }
})

const groupItems = computed(() => {
    const items = [];

    if (isGroupItem.value) {

        for (const subItem of renderItem.value[`Items${regionSettings.value.ServerName}`] ?? renderItem.value.Items ?? []) {

            let itemObj;

            switch (subItem.Type) {
                case 'Item':
                    itemObj = getItemById(subItem.Id);
                    break;
                case 'Furniture':
                    itemObj = getFurnitureById(subItem.Id);
                    break;
                case 'Currency':
                    itemObj = getCurrencyById(subItem.Id);
                    break;
                case 'Equipment':
                    itemObj = getEquipmentById(subItem.Id);                
                    break;
            }

            if (itemObj === undefined) {
                continue;
            }

            items.push({
                id: subItem.Id,
                type: subItem.Type,
                name: itemObj.Name,
                rarity: itemObj.Rarity,
                icon: `/images/${subItem.Type == 'Currency' ? 'item' : subItem.Type.toLowerCase()}/icon/${itemObj.Icon}.webp`,
                chanceLabel: `${+(subItem.Chance * 100).toFixed(2)}%`,
                amountLabel: `&times;${subItem.AmountMin}${subItem.AmountMax > subItem.AmountMin ? '~' + subItem.AmountMax : ''}`
            });
        }
    }

    return items;
})

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
            case 'gachagroup':
                return getGachaGroupById(props.itemId);
        }
    }
});

const tooltip = computed(() => {
    if (isGroupItem.value) {

        let bodyText = `<p class='mb-2'>${translateUi('item_contains_random')}</p>`;

        for (const [i, subItem] of groupItems.value.entries()) {
            if (i >= 6) {
                bodyText += `\n... (Click to view ${groupItems.value.length - i} more items)`;
                break;
            } else {
                bodyText += `${i > 0 ? '\n' : ''}<span class='col-item-${subItem.rarity}'>${subItem.name}</span> <b>${subItem.amountLabel}</b> (${subItem.chanceLabel})`;                
            }

        }

        return {
            title: 'Random Item',
            body: bodyText
        }
    } else {
        return {
            title: renderItem.value.Name,
            subtitle: translate('ItemCategory', renderItem.value.SubCategory ?? renderItem.value.Category) ?? translate('ItemCategory', props.itemType),
            rarity: renderItem.value.Tier ? `T${renderItem.value.Tier}` : renderItem.value.Rarity,
            icon: `/images/${iconPath.value}/icon/${renderItem.value.Icon}.webp`,
            body: renderItem.value.Desc,
            iconClass: 'img-scale-larger'
        }
    }

});

</script>

<template>
    <component :is="itemType.toLowerCase() == 'currency' || isGroupItem ? 'div' : 'RouterLink'"
        :class="{'cursor-pointer': isGroupItem}"
        :to="{name: itemType.toLowerCase() + 'view', params: { [itemType.toLowerCase() + 'id']: renderItem.Id }}"
        v-on="isGroupItem ? {click: () => {contentsModal.show();tooltipEl.hide();}} : {}">

        <Tooltip v-bind="tooltip" class="item-drop position-relative" ref="tooltipEl">
            <template v-if="isGroupItem">
                <!-- <img v-for="(item, index) in groupItems"
                v-show="index == activeSlide"
                class="ba-item-icon"
                :class="{[`ba-item-${item.rarity?.toLowerCase()}`]: true, 'mb-0': !primaryLabel && !iconLabel}"
                :src="item.icon"> -->
                <img class="ba-item-icon" :class="{[`ba-item-${groupItems[activeSlide].rarity?.toLowerCase()}`]: true, 'mb-0': !primaryLabel && !iconLabel}" :src="groupItems[activeSlide].icon">
                <!-- preload the next image-->
                <img v-show="false" :src="groupItems[Math.min(activeSlide + 1, groupItems.length - 1)].icon">
            </template>
            <img v-else class="ba-item-icon" :class="{[`ba-item-${renderItem.Rarity?.toLowerCase()}`]: true, 'mb-0': !primaryLabel && !iconLabel}" :src="`/images/${iconPath}/icon/${renderItem.Icon}.webp`" :alt="renderItem.Name">
            <span v-if="primaryLabel" class="ba-material-label">
                <img v-if="iconLabel" class="label-icon" :src="iconLabel">
                <span v-html="primaryLabel"></span>
            </span>
            <span v-if="secondaryLabel" class="label-droptype" v-html="secondaryLabel"></span>
            <!-- <img v-if="iconLabel" class="ba-favor-label" :src="iconLabel"> -->
        </Tooltip>

    </component>

    <Modal ref="contentsModal" v-if="isGroupItem">
        <template #title>
            <fa icon="box-open" class="me-2" />
            {{ translateUi('gachagroup_contents') }}
        </template>
        <template #body>
            <p>{{ translateUi('item_contains_random') }}</p>
            <div class="item-icon-list">
                <ItemIcon v-for="item in groupItems" :item-type="item.type" :item-id="item.id" :primary-label="item.chanceLabel" :secondary-label="item.amountLabel" />
            </div>
        </template>
    </Modal>

</template>