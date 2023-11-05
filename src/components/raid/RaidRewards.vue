<script setup>
import { ref, computed, watch } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { getRaidRewardSet, getRaidSeason, getRaidSeasons, raidDifficultyName, raidDifficultyNameAbbreviated } from '../../composables/Raids';
import { abbreviateNumber, shortDateFromTimestamp } from '../../composables/Utilities';
import ItemIcon from '../common/ItemIcon.vue';

const props = defineProps({
    raid: {
        type: Object,
        required: true
    }
});

const rewardMaxDifficulty = {36: 3, 40: 4, 44: 5, 48: 6, 54: 6, 56: 6}

const selectedSeasonId = ref(null);
const selectedType = ref(null);
const rewardLevel = ref(0);
const showCumulative = ref(true);

function setSeason(type, season) {
    selectedType.value = type;
    selectedSeasonId.value = season;
}

const raidSeasons = computed(() => {
    return getRaidSeasons(props.raid.Id);
})

const selectedSeason = computed(() => {
    if (selectedSeasonId.value == null || selectedType.value == null) {
        return null;
    }
    return getRaidSeason(selectedType.value, selectedSeasonId.value);
})

const raidRewardSet = computed(() => {
    if (selectedSeason.value == null) {
        return null;
    }
    return getRaidRewardSet(selectedType.value, selectedSeason.value.RewardSet);
})

const renderRaidRewards = computed(() => {
    const rewards = [];
    const totalItems = {};

    for (let i = 0; i <= rewardLevel.value; i++) {
        if (!showCumulative.value && i != rewardLevel.value) {
            continue;
        }

        for (const reward of raidRewardSet.value[i][1]) {

            const key = `${reward[0]}_${reward[1]}`

            if (!totalItems[key]) {
                totalItems[key] = 0;
            }

            totalItems[key] += reward[2];
        }
    }

    for (const itemKey in totalItems) {
        rewards.push({
            itemType: itemKey.split('_')[0],
            itemId: +(itemKey.split('_')[1]),
            primaryLabel: `×${abbreviateNumber(totalItems[itemKey])}`
        });
    }

    rewards.sort((a,b) => a.itemId - b.itemId);
    rewards.sort((a,b) => a.itemType.localeCompare(b.itemType));

    return rewards;
})

watch(selectedSeason, (newVal) => {
    if (newVal) {
        rewardLevel.value = newVal.RewardSetMax - 1;
    }
});

watch(() => props.raid, () => {
    selectedSeasonId.value = null;
    selectedType.value = null;
});

</script>

<template>
<div>
    <div class="d-flex flex-column gap-3">
        <div class="d-flex align-items-center gap-2 flex-wrap">
            <button class="btn-pill me-auto" data-bs-toggle="dropdown">
                <span v-if="selectedSeason == null" class="label">{{ translateUi('raid_season_select') }}</span>
                <span v-else class="label">{{ translate('StageType', selectedType) }} {{ translateUi('raid_season', selectedSeason.SeasonDisplay) }}</span>
                <fa icon="caret-down" class="me-2"></fa>
            </button>
            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-start dropdown-menu-scroll-large">
                <li>
                    <h6 class="dropdown-header">{{ translate('StageType', 'Raid') }}</h6>
                </li>
                <li v-for="season in raidSeasons.Raid">
                    <button class="dropdown-item" :class="{active: selectedType == 'Raid' && selectedSeasonId == season.SeasonId}" @click="setSeason('Raid', season.SeasonId)">
                        <div class="d-flex gap-1 align-items-end">
                            <span class="label me-3">{{ translateUi('raid_season', season.SeasonDisplay) }}</span>
                            <img class="ms-auto inline-img invert-light" :src="`/images/ui/Terrain_${season.Terrain}.png`">
                            <small class="text-bold">{{ raidDifficultyNameAbbreviated[rewardMaxDifficulty[season.RewardSetMax]] }}</small>
                            <small class="ms-1">
                                {{ shortDateFromTimestamp(season.Start) }} - {{ shortDateFromTimestamp(season.End) }}
                            </small>
                        </div>
                    </button>
                </li>
                <template v-if="raidSeasons.EliminateRaid.length">
                    <li>
                        <h6 class="dropdown-header">{{ translate('StageType', 'EliminateRaid') }}</h6>
                    </li>
                    <li v-for="season in raidSeasons.EliminateRaid">
                        <button class="dropdown-item" :class="{active: selectedType == 'EliminateRaid' && selectedSeasonId == season.SeasonId}" @click="setSeason('EliminateRaid', season.SeasonId)">
                            <div class="d-flex gap-1 align-items-end">
                                <span class="label me-3">{{ translateUi('raid_season', season.SeasonDisplay) }}</span>
                                <!-- <div class="ms-auto d-flex align-self-center">
                                    <span v-for="armorType in season.ArmorTypes" class="icon-type-small" :class="`bg-def-${armorType.toLowerCase()}`">
                                        <img src="/images/ui/Type_Defense_s.png">
                                    </span>
                                </div> -->
                                <img class="ms-auto inline-img invert-light" :src="`/images/ui/Terrain_${season.Terrain}.png`">
                                <small class="text-bold" :class="`ba-col-${season.TormentArmorType.toLowerCase()}`">{{ raidDifficultyNameAbbreviated[rewardMaxDifficulty[season.RewardSetMax]] }}</small>
                                <small class="ms-1">
                                    {{ shortDateFromTimestamp(season.Start) }} - {{ shortDateFromTimestamp(season.End) }}
                                </small>
                            </div>
                        </button>
                    </li>
                </template>
            </ul>
            <template v-if="selectedSeason">
                <div class="d-flex align-items-center gap-2">
                    <img class="invert-light" :src="`/images/ui/Terrain_${selectedSeason.Terrain}.png`" width="26">
                    <!-- <b>{{ translate('AdaptationType', selectedSeason.Terrain) }}</b> -->
                    <span v-if="selectedType == 'Raid'" class="text-italic text-bold text-uppercase">{{ raidDifficultyName[rewardMaxDifficulty[selectedSeason.RewardSetMax]] }}</span>
                    <span v-if="selectedType == 'EliminateRaid'" class="text-italic text-bold">
                        <template v-for="(armorType, index) in selectedSeason.ArmorTypes">
                            <template v-if="index > 0"> / </template>
                            <span :class="`ba-col-${armorType.toLowerCase()}`">
                                {{ armorType == selectedSeason.TormentArmorType ? 'TOR' : 'INS' }}
                            </span>
                        </template>
                    </span>
                    <span>
                        {{ shortDateFromTimestamp(selectedSeason.Start) }} - {{ shortDateFromTimestamp(selectedSeason.End) }}
                    </span>
                </div>
            </template>
        </div>

        <div v-if="selectedSeason" class="d-flex flex-column gap-2">
            <h5 class="text-bold">{{ translateUi('rewards_season') }}</h5>
            <div class="d-flex flex-row align-items-center gap-2">
                <button class="btn-pill" :class="{deactivated: !showCumulative}" @click="showCumulative = !showCumulative">
                    <span class="label">
                        <fa icon="square" class="off" />
                        <fa icon="square-check" class="on" />
                        <span class="ps-2">{{ translateUi('show_cumulative') }}</span>
                    </span>
                </button>
                <input type="range" class="form-range flex-fill" v-model="rewardLevel" :min="0" :max="selectedSeason.RewardSetMax - 1">
                <span class="ba-slider-label">
                    {{ abbreviateNumber(raidRewardSet[rewardLevel][0]) }}
                </span>            
            </div>
            <div class="ba-panel p-2">
                <div class="item-icon-list">
                    <ItemIcon v-for="reward in renderRaidRewards" v-bind="reward" />
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
    .ba-slider-label {
        min-width: 70px;
    }
</style>