<script setup>
import { computed, inject, ref, watch } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { getRaidById, raidDifficultyName, raidEnemyLevel } from '../../composables/Raids';
import { formatTime, wrapArray } from '../../composables/Utilities';
import { useSettingsStore } from '../../stores/SettingsStore';
import { getEnemyById } from '../../composables/Enemies';
import EnemyList from '../enemy/EnemyList.vue';
import RaidSkillPanel from './RaidSkillPanel.vue';
import TimeAttackRules from './TimeAttackRules.vue';
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';
import RaidRewards from './RaidRewards.vue';
import StageRewards from '../stage/StageRewards.vue';

const props = defineProps({
    raid: {
        type: Object,
        required: true
    },
    type: String
})

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');

const useThreeCol = inject('useThreeCol');

const settings = useSettingsStore().settings;

const difficulty = ref(0);
const tabs = computed(() => {
    switch (props.type) {
        case 'Raid':
            return ['skills', 'rewards']
        case 'WorldRaid':
            return ['skills', 'rewards']
        case 'TimeAttack':
            return ['rules']
    }
})

const difficultyNames = computed(() => {
    const names = [];

    for (let i = 0; i <= props.raid.MaxDifficulty[settings.server]; i++) {
        if (props.type == 'TimeAttack') {
            names.push(translateUi('ta_phase', i + 1))
        } else {
            names.push(props.raid.DifficultyName?.[i] ?? raidDifficultyName[i])
        }       
    }

    return names;
})

const headerStyle = computed(() => {
    if (props.type !== 'TimeAttack') {
        return {
            backgroundImage: `url('/images/raid/Boss_Portrait_${props.raid.DevName}${difficulty.value >= 5 && props.type == 'Raid' ? '_Insane' : ''}_Lobby.png')`
        }
    }
})

const activeTab = ref(tabs.value[0]);

const raidName = computed(() => {
    if (props.type == 'TimeAttack') {
        return `${props.raid.Id}: ${translate("TimeAttackStage", props.raid.DungeonType)}`;
    } else {
        return props.raid.Name;
    }
    
})

const raidEnemies = computed(() => {

    const enemies = [];

    if (props.type == 'TimeAttack') {

        const formation = props.raid.Formations[difficulty.value];

        for (const enemyId of formation.EnemyList) {
            const enemyObj = getEnemyById(enemyId);

            enemies.push({
                enemy: enemyObj,
                level: formation[`Level${enemyObj.Rank}`] ?? formation.LevelMinion,
                grade: formation[`Grade${enemyObj.Rank}`] ?? formation.GradeMinion,
                bonuses: getRaidExtraStats(enemyId)
            });  
        }

    } else {

        for (const enemyId of props.raid.EnemyList[difficulty.value]) {

            enemies.push({
                enemy: getEnemyById(enemyId),
                level: props.raid.Level?.[difficulty.value] ?? raidEnemyLevel[difficulty.value],
                grade: 1,
                bonuses: getRaidExtraStats(enemyId),
            });
        }

    }


    return enemies;
})

function getRaidExtraStats(enemyId) {
    const bonuses = [];

    if (props.raid.EnemyExtraStats?.[enemyId]) {

        for (const extraStats of props.raid.EnemyExtraStats[enemyId]) {

            if (extraStats.Difficulty && (difficulty.value < extraStats.Difficulty[0] || difficulty.value > extraStats.Difficulty[1])) {
                continue;
            }

            bonuses.push(extraStats)
        }

    }

    return bonuses;
}

const raidSkills = computed(() => {
    if (props.raid.UseRaidSkillList) {
        return getRaidById(props.raid.UseRaidSkillList).RaidSkill;
    } else {
        return props.raid.RaidSkill;
    }
})

watch(() => props.raid, () => {
    if (difficulty.value > props.raid.MaxDifficulty[settings.server]) {
        difficulty.value = 0;
    }
    if (!tabs.value.includes(activeTab.value)) {
        activeTab.value = tabs.value[0];
    }
})

</script>

<template>
    <div class="card h-100">
        <div class="d-flex gap-2 h-100 overflow-hidden" :class="{'flex-column': !useThreeCol}">

            <div class="d-flex raid-column flex-column gap-2 py-2" :class="{'col-50': useThreeCol}">

                <div class="raid-header px-2" :style="headerStyle">
                    <div class="pt-2">
                        <h5 class="px-1 mb-0">{{ translate('StageType', type) }}</h5>
                        <h1 class="title-text px-1 mb-2" :class="{'text-uppercase': type != 'TimeAttack'}">{{ raidName }}</h1>
                        <div class="d-flex align-items-center flex-wrap gap-2">
                            <span v-for="terrain in wrapArray(raid.Terrain)" class="ba-panel">
                                <img id="ba-raid-terrain-img" class="ba-student-terrain-icon invert-light" :src="`/images/ui/Terrain_${terrain}.png`">
                            </span>
                            <span class="ba-info-pill bg-theme text-bold">
                                <span class="label">Lv. {{ props.raid.Level?.[difficulty] ?? raidEnemyLevel[difficulty] }}</span>
                            </span>
                            <span class="ba-info-pill bg-theme text-bold my-0">
                                <span class="label">
                                    <fa icon="stopwatch" class="me-1" />
                                    {{ formatTime(raid.BattleDuration[difficulty]) }}                                
                                </span>
                            </span>
                            <span id="ba-raid-entrycost" class="d-flex align-items-center justify-content-center">

                            </span>                           
                        </div>
                    </div>
                </div>

                <div class="flex-fill px-2" :class="{scroll: useThreeCol}">
                    <nav class="nav nav-pills justify-content-center py-2">
                        <button v-for="n in raid.MaxDifficulty[settings.server] + 1" class="nav-link text-italic text-uppercase" :class="{active: difficulty == n-1}" @click="difficulty = n-1">
                            {{ difficultyNames[n - 1] }}
                        </button>
                    </nav>
                    <EnemyList :enemies="raidEnemies" />
                </div>
                <!-- <h4 class="text-bold mb-0">{{ translateUi('stage_enemies') }}</h4> -->
                
            </div>
            <div class="d-flex raid-column flex-column gap-3 py-2" :class="{'col-50': useThreeCol}">
                <nav class="nav nav-pills justify-content-center px-2">
                    <button v-for="tab in tabs" class="nav-link" :class="{active: activeTab == tab}" @click="activeTab = tab">
                        {{ translateUi(tab) }}
                    </button>
                </nav>
                <div class="flex-fill px-2" :class="{scroll: useThreeCol}">

                    <RaidSkillPanel v-if="activeTab == 'skills'" :skills="raidSkills" :raid-difficulty="difficulty" />
                    <TimeAttackRules v-if="activeTab == 'rules'" :rules="raid.Rules[difficulty]" />

                    <template v-if="activeTab == 'rewards'">

                        <RaidRewards v-if="type == 'Raid'" :raid="raid" />

                        <div v-if="type == 'WorldRaid'" class="ba-panel p-2">
                            <StageRewards :rewards="raid.Rewards[difficulty]" />
                        </div>
                        
                    </template>

                </div>
                

            </div>
            
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.raid-header {
    background-size: contain;
    background-repeat: no-repeat;
    background-position-x: 125%;
}

.card {
    
    padding: 0.5rem;

    @include md-down {
        border-radius: 0px;
        margin-bottom: 0;
        padding: 0.5rem 0;
    }
}

.raid-column {
    
    width: 100%;

    &.col-50 {
        width: 50%;
    }
    
}

.scroll {
    @include scrollable(scroll);
}

.overflow-hidden {
    overflow-y: hidden;
}

</style>