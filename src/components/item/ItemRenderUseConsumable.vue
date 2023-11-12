<script setup>
import { computed } from 'vue';
import { getCurrencyById } from '../../composables/Currency';
import { getEquipmentById } from '../../composables/Equipment';
import { getFurnitureById } from '../../composables/Furniture';
import { getGachaGroupById } from '../../composables/GachaGroup';
import { getItemById } from '../../composables/Items';
import { translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import ItemIcon from '../common/ItemIcon.vue';

const props = defineProps({
    item: {
        type: Object,
        required: true
    }
});

const renderItems = computed(() => {

    const items = [];
    let message;

    const gachaGroup = props.item.ConsumeType == 'Random' ? getGachaGroupById(props.item.GachaGroupId) : null;

    if (props.item.ConsumeType == 'Choice') {
        message = translateUi('item_contains_choice');
    } else {
        message = gachaGroup.RewardAll ? translateUi('item_contains') : translateUi('item_contains_random');
    }

    const subItemList = props.item.ConsumeType == 'Choice' ?
        (props.item[`Items${regionSettings.value.ServerName}`] ?? props.item.Items ?? []) :
        (gachaGroup[`Items${regionSettings.value.ServerName}`] ?? gachaGroup.Items ?? [])

    for (const subItem of subItemList) {

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

        const secondaryLabel = subItem.AmountMax > 1 ? `&times;${subItem.AmountMin}${subItem.AmountMax > subItem.AmountMin ? '~' + subItem.AmountMax : ''}` : null;

        if (props.item.ConsumeType == 'Choice') {

            items.push({
                itemType: subItem.Type,
                item: itemObj,
                primaryLabel: subItem.AmountMax == subItem.AmountMin ? `&times;${subItem.AmountMax}` : null,
                secondaryLabel,
            });

        } else {

            items.push({
                itemType: subItem.Type,
                item: itemObj,
                primaryLabel: (gachaGroup.RewardAll) ? '100%' : `${+(subItem.Chance * 100).toFixed(2)}%`,
                secondaryLabel,
            });

        }
        
    }

    return {items, message};

})

</script>

<template>
    <div class="ba-panel p-2 d-flex flex-column gap-2">
        <p>{{ renderItems.message }}</p>
        <div class="item-icon-list">
            <ItemIcon v-for="item in renderItems.items" :key="item.itemType+item.item.Id" v-bind="item" />
        </div>
    </div>
</template>