<script setup>
import { computed, ref, watch } from 'vue';
import { getItemById } from '../../composables/Items';
import { translate, translateUi } from '../../composables/Localization';
import { useSettingsStore } from '../../stores/SettingsStore';
import { getEquipmentById, getEquipmentStats, useEquipmentStats } from '../../composables/Equipment';
import StatsTable from '../common/StatsTable.vue';
import ItemRenderUses from './ItemRenderUses.vue';
import ItemRenderFurnitureInteraction from './ItemRenderFurniture.vue';

const weaponEXPBonuses = {
    WeaponExpGrowthA: 'SMG, SG, HG, FT',
    WeaponExpGrowthB: 'AR, GL, RL',
    WeaponExpGrowthC: 'MG, SR, MT, RG',
    WeaponExpGrowthZ: 'ALL',
}

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

const equipmentLevel = ref(props.item.MaxLevel ?? 1);

const settings = useSettingsStore().settings;

const equipmentStats = computed(() => {
    if (props.type == 'equipment' && props.item.MaxLevel > 1) {
        const stats = useEquipmentStats(props.item, equipmentLevel);
        return stats;
    } else {
        return null;
    }
})

const tableInfo = computed(() => {
    const tableInfo = [];
    if (props.type == 'item') {
        if (props.item.ExpValue > 0) {
            tableInfo.push({
                colClass: 'col-6',
                label: 'EXP Value',
                value: props.item.ExpValue.toLocaleString()
            });
        }
    }

    if (props.type == 'furniture') {
        tableInfo.push({
            colClass: 'col-6',
            label: translateUi('comfort'),
            valueIcon: '/images/ui/Cafe_Icon_Comfort.png',
            value: props.item.ComfortBonus
        });
        tableInfo.push({
            colClass: 'col-6',
            label: translateUi('furniture_size'),
            value: props.item.Category == 'Interiors' ? '-' : `${props.item.Size[0]} × ${props.item.Size[1]}`
        });
        // tableInfo.push({
        //     colClass: 'col-12',
        //     label: translateUi('furniture_set'),
        //     value: translate('FurnitureSet', props.item.SetGroupId)
        // });
    }

    if (props.item.CraftQuality > 0) {
        tableInfo.push({
            colClass: 'col-6',
            label: 'Synthesis Value',
            value: props.item.CraftQuality.toLocaleString()
        });
    }

    if (props.item.ShiftingCraftQuality?.[settings.server] > 0) {
        tableInfo.push({
            colClass: 'col-6',
            label: 'Fusion Value',
            value: props.item.ShiftingCraftQuality[settings.server].toLocaleString()
        });
    }

    if (props.item.LevelUpFeedExp > 0) {
        tableInfo.push({
            colClass: 'col-6',
            label: 'EXP Value',
            value: props.item.LevelUpFeedExp.toLocaleString()
        });
    }

    if (props.item.Category.startsWith('WeaponExpGrowth')) {
        
        tableInfo.push({
            colClass: 'col-6',
            label: 'EXP Bonus (1.5×)',
            value: weaponEXPBonuses[props.item.Category]
        });
    }

    return tableInfo;
})

watch(() => props.item, (newItem) => {
    if (newItem.MaxLevel) {
        equipmentLevel.value = newItem.MaxLevel;
    }
}, {flush: 'post'});

function getFurnitureStarGrade(rarity) {
    switch (rarity) {
        case 'N':
        case 'R':
            return 1;
        case 'SR':
            return 2;
        case 'SSR':
            return 3;
        default:
            return 0;
    }
}

</script>

<template>
<div id="ba-item-details-container" class="card p-2">
    <div class="card-header">
        <div class="d-flex flex-row align-items-top px-1 pt-2">
            <div class="flex-grow-1">
                <div>
                    <h2 id="ba-item-name" class="title-text mb-3">{{ item.Name }}</h2>
                    <div class="d-flex gap-2 flex-wrap">
                        <h5 class="mb-0" id="ba-item-type">{{ translate('ItemCategory', item.Category) }}</h5>
                        <template v-if="item.SubCategory">
                            <h5 class="mb-0">/</h5>
                            <h5 class="mb-0" id="ba-item-type">{{ translate('ItemCategory', item.SubCategory) }}</h5>
                        </template>
                        <span id="ba-item-rarity" class="ba-info-pill-s bg-theme ms-2">
                            <span class="label"><fa icon="circle" class="me-2" :class="`col-item-${item.Rarity.toLowerCase()}`"></fa>{{ item.Rarity }}</span>
                        </span>
                        <span v-if="type == 'furniture'" class="text-bold ba-info-pill-s bg-theme">
                            <span class="label"><fa v-for="i in getFurnitureStarGrade(item.Rarity)" icon="star"/></span>
                        </span>
                        <span v-if="type == 'equipment' && item.Tier > 0" class="text-bold ba-info-pill-s bg-theme">
                            <span class="label">T{{ item.Tier }}</span>
                        </span>
                        <template v-if="settings.showDeveloperProps">
                            <div class="ba-info-pill-s bg-theme px-2 text-muted ms-auto"
                                v-if="item.Tags && item.Tags.length"
                                v-tooltip="'<b>Tags:</b> ' + item.Tags?.join(', ')">
                                {{ item.Id }} <fa icon="tag" class="ms-2" />
                            </div>
                            <div class="ba-info-pill-s bg-theme px-2 text-muted ms-auto" v-else>
                                {{ item.Id }}
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card-body d-flex flex-column gap-3">
        <h6 v-if="type == 'furniture'" class="px-1 mb-0">
            <b>{{ translateUi('furniture_set') }}:</b>
            <i class="ms-2">{{ translate('FurnitureSet', props.item.SetGroupId) }}</i>
        </h6>
        <div class="item-details d-flex gap-2">
            <div class="item-image p-2 ba-panel text-center">
                <img id="item-icon-full" class="item-icon-full" :src="`/images/${type}/full/${item.Icon}.webp`">
            </div>
            <div class="d-flex flex-fill flex-column gap-2">
                <div class="ba-panel">
                    <p id="ba-item-description" class="p-2 mb-0">{{ item.Desc }}</p>
                </div>
                <div v-if="tableInfo.length" class="ba-panel">
                    <div class="row g-0">
                        <div v-for="col in tableInfo" class="p-2" :class="col.colClass">
                            <div class="d-flex align-items-center justify-content-between">
                                <span>{{ col.label }}</span>
                                <span class="ms-2 text-bold text-end">
                                    <img v-if="col.valueIcon" class="inline-img" :src="col.valueIcon">
                                    {{ col.value }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <template v-if="equipmentStats">
                    <div class="ba-panel ba-stats">
                        <StatsTable :character-stats="equipmentStats"></StatsTable>
                    </div>
                    <div class="d-flex flex-row align-items-center">
                        <input v-model="equipmentLevel" type="range" class="form-range me-2 flex-fill" :min="1" :max="item.MaxLevel">
                        <span class="ba-slider-label">{{ 'Lv. ' + equipmentLevel }}</span>
                    </div>
                </template>
            </div>

        </div>
        
        <ItemRenderUses v-if="type == 'item'" :item="item"></ItemRenderUses>
        <ItemRenderFurnitureInteraction v-if="type == 'furniture'" :furniture="item"></ItemRenderFurnitureInteraction>

        <!-- <div id="ba-equipment-recipe" class="ba-panel p-2 mt-2"></div>
        
        <div id="ba-item-sources" class="ba-panel p-2 mt-2"></div>
        <div id="ba-item-shops" class="ba-panel p-2 mt-2"></div>
        <div id="ba-item-craftnodes" class="ba-panel p-2 mt-2"></div>
        <div id="ba-item-consumables" class="ba-panel p-2 mt-2"></div> -->
    </div>
</div>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.card {
    
    padding: 0.5rem;
    margin-bottom: 1rem;

    @include md-down {
        border-radius: 0px;
        padding: 0.5rem 0;
        margin-bottom: 0;
    }
}

.item-details {

    align-items: start;

    @include md-down {
        flex-direction: column;
        align-items: stretch;

        .item-image {
            width: 100%;
        }
    }
}

</style>