<script setup>
import { breakpointsBootstrapV5, useBreakpoints, useMediaQuery } from '@vueuse/core';
import { computed, inject, ref, watch } from 'vue';
import { getEnemyById, rankSortOrder } from '../../composables/Enemies';
import { translate, translateUi } from '../../composables/Localization';
import { useSettingsStore } from '../../stores/SettingsStore';
import EnemyList from '../enemy/EnemyList.vue';
import StageMap from './StageMap.vue';
import StageRewards from './StageRewards.vue';
import { regionSettings } from '../../composables/RegionSettings';
import Tooltip from '../common/Tooltip.vue';
import { getCurrencyById } from '../../composables/Currency';
import { getItemById } from '../../composables/Items';

const props = defineProps({
    stage: {
        type: Object,
        required: true
    }
})

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');
const useThreeCol = inject('useThreeCol');

const settings = useSettingsStore().settings;

const activeTab = ref('Enemies');
const unitFilter = ref(0);

const stageRewards = computed(() => {
    return props.stage[`Rewards${regionSettings.value.ServerName}`] ?? props.stage.Rewards;
})

const stageEnemies = computed(() => {

    const uniqueEnemies = {};

    for (const formation of props.stage.Formations) {

        if (unitFilter.value && formation.Id != unitFilter.value) {
            continue;
        }

        for (const enemyId of formation.EnemyList) {
            const enemyObj = getEnemyById(enemyId);
            const enemyLevel = formation[`Level${enemyObj.Rank}`] ?? formation.LevelMinion;
            const enemyGrade = formation[`Grade${enemyObj.Rank}`] ?? formation.GradeMinion;

            const uniqueKey = `${enemyId}_${enemyLevel}_${enemyGrade}`;

            if (!uniqueEnemies[uniqueKey]) {
                uniqueEnemies[uniqueKey] = {
                    enemy: enemyObj,
                    level: enemyLevel,
                    grade: enemyGrade
                };
            }
            
        }

    }

    return Object.values(uniqueEnemies).sort((a, b) => rankSortOrder[b.enemy.Rank] - rankSortOrder[a.enemy.Rank] || a.enemy.Id - b.enemy.Id);
})

const stageConditions = computed(() => {

    const stars = [];
    const challenges = [];

    if (props.stage.HexaMap) {

        stars.push(translateUi('starcondition_complete'));
        stars.push(translateUi('starcondition_sranks', props.stage.StarCondition[0]));
        stars.push(translateUi('starcondition_clearturns', props.stage.StarCondition[1]));

    } else {

        switch (props.stage.Type) {
            case 'ChaserA':
            case 'ChaserB':
            case 'ChaserC':
                stars.push(translateUi('starcondition_clear'));
                stars.push(translateUi('starcondition_allsurvive'));
                stars.push(translateUi('starcondition_cleartime', 150));
                break;
            case 'SchoolA':
            case 'SchoolB':
            case 'SchoolC':
            case 'Blood':
                stars.push(translateUi('starcondition_clear'));
                stars.push(translateUi('starcondition_allsurvive'));
                stars.push(translateUi('starcondition_cleartime', 120));
                break;
            case 'FindGift':
                stars.push(translateUi('starcondition_earnrewards', 1));
                stars.push(translateUi('starcondition_earnrewards', 4));
                stars.push(translateUi('starcondition_earnrewards', 5));
                break;
            default:
                stars.push(translateUi('starcondition_defeatall'));
                stars.push(translateUi('starcondition_defeatalltime', props.stage.StarCondition[0]));
                stars.push(translateUi('starcondition_allsurvive'));
                break;
        }

    }


    for (const condition of props.stage.ChallengeCondition ?? []) {

        switch (condition[0]) {
            case 'Time':
                challenges.push(translateUi('starcondition_cleartime', [condition[1]]));
                break;
            case 'Turns':
                challenges.push(translateUi('starcondition_clearturns', [condition[1]]));
                break;
        }
        
    }

    return {stars, challenges};
})

const stageEntryCost = computed(() => {

    const entryCost = [];

    for (const cost of props.stage.EntryCost) {
        const currency = cost[0] < 100 ? getCurrencyById(cost[0]) : getItemById(cost[0]);
        entryCost.push({
            title: currency.Name,
            subtitle: cost[0] < 100 ? translate('ItemCategory', 'Currency') : translate('ItemCategory', currency.Category),
            rarity: currency.Rarity,
            icon: `/images/item/icon/${currency.Icon}.webp`,
            body: currency.Desc,
            iconClass: 'img-scale-larger',
            amount: cost[1]
        })
    }

    return entryCost;
})

function setUnitFilter(id) {
    unitFilter.value = id;
    activeTab.value = 'Enemies';
}

watch(() => props.stage, (newVal) => {
    if (activeTab.value == 'Map' && !newVal.HexaMap) {
        activeTab.value = 'Enemies';
    }

    if (unitFilter.value) {
        unitFilter.value = 0;
    }
})

</script>

<template>
    <div class="card h-100">
        <div class="d-flex h-100 flex-column gap-3 py-2">

            <div class="d-flex" :class="{'flex-column gap-3': !useThreeCol}">

                <div class="px-2 column-half align-self-start d-flex flex-column" :class="{'col-50': useThreeCol}">

                    <div class="pt-2">
                        <h5 class="px-1 mb-0">{{ stage.Title ?? translate('StageType', stage.Type) }}</h5>
                        <h2 class="title-text px-1 mb-2">{{ stage.Name }}</h2>
                        <div class="d-flex align-items-center flex-wrap gap-2">
                            <span id="ba-stage-terrain" class="ba-panel"><img class="ba-student-terrain-icon invert-light" :src="`/images/ui/Terrain_${stage.Terrain}.png`"></span>
                            <span v-if="stage.Category == 'Campaign' && stage.Difficulty == 1" id="ba-stage-fog" class="ba-panel"><img class="ba-student-terrain-icon invert-light" :src="'/images/ui/Terrain_fog.png'"></span>
                            <span class="ba-info-pill bg-theme text-bold">
                                <span class="label">{{ translateUi('rec_level') }} Lv.{{ stage.Level }}</span>
                            </span>
                            <span class="d-flex flex-wrap gap-2">
                                <Tooltip v-for="entryCost in stageEntryCost" v-bind="entryCost" class="ba-info-pill bg-theme">
                                    <img :src="entryCost.icon" height="26">
                                    <span class="label ps-0 text-bold">&times;{{ entryCost.amount }}</span>
                                </Tooltip>
                            </span>
                        </div>
                    </div>

                    <div class="ba-panel p-2 mt-2">
                        <div v-for="condition of stageConditions.stars">
                            <fa icon="star" class="condition-icon star" /><span v-html="condition"></span>
                        </div>
                        <div v-if="stageConditions.challenges.length" class="ba-panel-separator my-2"></div>
                        <div v-for="condition of stageConditions.challenges">
                            <fa icon="clipboard-list" class="condition-icon" /><span v-html="condition"></span>
                        </div>
                    </div>
                </div>

                <div class="column-half align-self-end px-2" :class="{'col-50': useThreeCol}">
                    <h5 class="text-bold mb-2">{{ translateUi('rewards') }}</h5>
                    <div class="ba-panel d-flex align-items-center justify-content-center p-2 h-100">
                        <div class="">
                            <StageRewards :rewards="stageRewards" />
                        </div>                        
                    </div>

                </div>

            </div>

            <nav class="nav nav-pills justify-content-center px-2">
                <button class="nav-link" :class="{active: activeTab == 'Enemies'}" @click="activeTab = 'Enemies'">
                    {{ translateUi('stage_enemies') }}
                </button>
                <button v-if="stage.HexaMap" class="nav-link" :class="{active: activeTab == 'Map'}" @click="activeTab = 'Map'">
                    {{ translateUi('stage_map') }}
                </button>
            </nav>
            
            <div class="flex-fill" style="min-height: 0;">
                <div v-show="activeTab == 'Enemies'">

                    <div class="px-2">
                        <EnemyList :enemies="stageEnemies" :horizontal-mode="useThreeCol" :unit-filter="unitFilter > 0" @clear-unit-filter="() => unitFilter = 0" />
                    </div>
    
                </div>

                <div v-if="stage.HexaMap" v-show="activeTab == 'Map'" class="h-100 px-2">
                    <div class="ba-panel p-2 map-wrapper">
                        <StageMap :stage="stage" :selected-unit="unitFilter" @select-unit="setUnitFilter" />
                    </div>
                </div>
                
            </div>
            
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

@mixin three-col() {
    @media only screen and (min-width: (1800px)) {
        @content;
    }
}


.page {
    @include three-col{
        height: calc(100vh - 56px);
    }
}

.card {
    
    padding: 0.5rem;

    @include md-down {
        border-radius: 0px;
        margin-bottom: 0;
        padding: 0.5rem 0;
    }
}

.column-half {
    
    width: 100%;

    &.col-50 {
        width: 50%;
    }
    
}

.condition-icon {
    width: 18px;
    margin-right: 8px;

    &.star {
        color: var(--col-text-stars);
    }
}

.map-wrapper {
    @include flex(center, center);
    height: 100%;
    position: relative;
}

</style>