<script setup>
import { computed } from "vue";
import { translate, translateUi } from '../../composables/Localization';
import { criticalChance, defMitigation, stabilityMinimum } from "../../composables/CharacterStats";
import Tooltip from './Tooltip.vue';
import { getStatIconClass, getStatIconName } from "../../composables/Icon";
import { breakpointsBootstrapV5, useBreakpoints, useMediaQuery } from "@vueuse/core";

const props = defineProps({
    characterStats: {
        type: Object,
        required: true
    },
    statList: {
        type: Array,
        default: []
    },
    hideAmmoCount: {
        type: Boolean,
        default: false
    }
})

const tooltips = computed(() => {
    const tooltips = {};
    for (const stat of props.statList) {

        const calculatedStat = props.characterStats.calculatedStats.value[stat];

        let tooltipBody = `<p class="mb-2">${translate('StatTooltip', stat)}</p>Base Value: <b>${calculatedStat.base.toLocaleString()}</b>`;

        for (const bonusSrc of calculatedStat.bonuses?.BonusList) {
            if (bonusSrc.Amount !== 0) {
                tooltipBody += `\n${bonusSrc.Name}: <b class="text-emphasis">+${bonusSrc.Type == 'Coefficient' ? +((bonusSrc.Amount/100).toFixed(2)).toLocaleString() + '%' : bonusSrc.Amount.toLocaleString()}</b>`
            }
        }

        tooltips[stat] = {
            title: translate('Stat', stat),
            // subtitle: 'Stat',
            // icon: `/images/staticon/svg/${stat.split('_')[0]}.svg`,
            // iconSize: [36, 36], 
            body: tooltipBody,
            placement: 'right'
        }
    }
    return tooltips;
})

const defMitigationStr = computed(() => {
    return `${((1 - defMitigation(props.characterStats.calculatedStats.value.DefensePower.total)) * 100).toFixed(2)}%`
})

const stabilityMinimumStr = computed(() => {
    return `${(stabilityMinimum(props.characterStats.calculatedStats.value.StabilityPoint.total, props.characterStats.calculatedStats.value.StabilityRate.total ?? 2000) * 100).toFixed(2)}%`
})

const hideDetailValues = useMediaQuery('(max-width: 480px)');

const statRows = computed(() => {
    return props.statList.length ? props.statList : Object.keys(props.characterStats.calculatedStats.value);
});
const columnClass = 'col-12'

</script>

<template>
    <div class="row g-0">
        <div v-for="stat in statRows" :class="columnClass">
            <div class="d-flex pe-2 py-1 w-100 align-items-center">
                <inline-svg class="stat-icon-svg mx-1" :class="getStatIconClass(stat)" :src="`/images/staticon/svg/${getStatIconName(stat)}.svg`"></inline-svg>
                <span class="stat-name">{{ translate('Stat', stat.split('_')[0]) }}</span>
                <div class="stat-value ms-auto">
                    <span v-if="!hideDetailValues" class="stat-base">{{ characterStats.calculatedStats.value[stat].baseStr }}</span>
                    <span v-if="!hideDetailValues" class="stat-flat" :class="{zero: characterStats.calculatedStats.value[stat].bonuses.Base == 0}">
                        +{{ characterStats.calculatedStats.value[stat].bonuses.Base.toLocaleString() }}
                    </span>
                    <span v-if="!hideDetailValues" class="stat-coefficient" :class="{zero: characterStats.calculatedStats.value[stat].bonuses.Coefficient == 1}">
                        +{{ +((characterStats.calculatedStats.value[stat].bonuses.Coefficient - 1) * 100).toFixed(2) }}%
                    </span>
                    <span class="stat-final">
                        {{ stat == 'AmmoCount' && hideAmmoCount ? '-' : characterStats.calculatedStats.value[stat].totalStr }}
                    </span>
                
                </div>
                <Tooltip class="help ms-3" v-bind="tooltips[stat]">
                    <fa class="" icon="circle-question"></fa>
                </Tooltip>
            </div>

            <div v-if="stat == 'DefensePower'" class="d-flex align-items-center px-2 pb-1 row-extra">
                <span class="stat-name">Damage Reduction</span>
                <div class="stat-value">
                    <span class="stat-final">
                        {{ defMitigationStr }}
                    </span>
                </div>
            </div>
            <div v-if="stat == 'StabilityPoint'" class="d-flex align-items-center px-2 pb-1 row-extra">
                <span class="stat-name">Minimum Damage</span>
                <div class="stat-value">
                    <span class="stat-final">
                        {{ stabilityMinimumStr }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.stat-value {
    padding-left: 0.5rem;
    cursor: default;
}

.stat-total {
    min-width: 5rem;
    font-weight: 700;
}

.row-extra {

    .stat-name {
        margin-left: 30px;
        font-style: italic;
    }

    .stat-value {
        font-style: italic;
        margin-left: auto;
        width: initial;
        margin-right: 40px;
    }

}
</style>