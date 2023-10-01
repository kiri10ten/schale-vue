<script setup>
import { getItemById } from '../../composables/Items';
import { translate, translateUi } from '../../composables/Localization';

const props = defineProps({
    type: String,
    item: {
        type: Object,
        required: true,
        default(rawProps) {
            return getItemById(1);
        }
    }

});



</script>

<template>
<div id="ba-item-details-container" class="card p-2">
    <div class="card-header">
        <div class="d-flex flex-row align-items-top px-1 pt-2">
            <div class="flex-grow-1">
                <div>
                    <h2 id="ba-item-name" class="title-text mb-3">{{ item.Name }}</h2>
                    <div class="d-flex gap-1">
                        <h5 class="d-inline-block me-2 mb-0" id="ba-item-type">{{ translate('ItemCategory', item.SubCategory ?? item.Category) }}</h5>
                        <span id="ba-item-rarity" class="ba-info-pill-s bg-theme">
                            <span class="label"><fa icon="circle" class="me-1" :class="`col-item-${item.Rarity.toLowerCase()}`"></fa>{{ item.Rarity }}</span>
                        </span>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <div class="card-body">
        <div class="ba-panel">
            <p class="text-center p-2 mb-0"><img id="item-icon-full" class="item-icon-full" :src="`/images/${type}/full/${item.Icon}.webp`"></p>
            <!-- <div id="ba-equipment-details" class="ba-stats"></div> -->
            <p id="ba-item-description" class="p-2 mb-0">{{ item.Desc }}</p>
            <table v-if="type == 'furniture'" id="ba-furniture-details" class="table ba-stats mb-0">
                <tbody>
                    <tr>
                        <td width="50%">
                            <div class="d-flex align-items-top justify-content-between">
                                <span>{{ translateUi('comfort') }}</span>
                                <span class="ms-2 text-bold text-end">
                                    <img class="inline-img" :src="'/images/ui/Cafe_Icon_Comfort.png'">
                                    {{ item.ComfortBonus }}
                                </span>
                            </div>
                        </td>
                        <td width="50%">
                            <div class="d-flex align-items-top justify-content-between">
                                <span>{{ translateUi('furniture_size') }}</span>
                                <span class="ms-2 text-bold text-end">{{ item.Category == 'Interiors' ? '-' : `${item.Size[0]} &times; ${item.Size[1]}` }}</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <div class="d-flex align-items-top justify-content-between">
                                <span>{{ translateUi('furniture_set') }}</span>
                                <span class="ms-2 text-bold text-end">{{ translate('FurnitureSet', item.SetGroupId) }}</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="ba-equipment-recipe" class="ba-panel p-2 mt-2"></div>
        <div id="ba-item-usage" class="ba-panel p-2 mt-2"></div>
        <div id="ba-item-sources" class="ba-panel p-2 mt-2"></div>
        <div id="ba-item-shops" class="ba-panel p-2 mt-2"></div>
        <div id="ba-item-craftnodes" class="ba-panel p-2 mt-2"></div>
        <div id="ba-item-consumables" class="ba-panel p-2 mt-2"></div>
    </div>
</div>
</template>