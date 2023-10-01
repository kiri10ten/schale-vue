<script setup>
import { computed } from "vue";
import { translate, translateUi } from '../../composables/Localization';
import { criticalChance, defMitigation, stabilityMinimum } from "../../composables/CharacterStats";

const props = defineProps({
    characterStats: {
        type: Object,
        required: true
    },
    statList: {
        type: Array,
        default: []
    },
    columns: {
        type: Number,
        default: 2
    },
    enableDerivedTooltip: {
        type: Boolean,
        default: false
    },
    hideAmmoCount: {
        type: Boolean,
        default: false
    }
})

const derivedStats = {
    CriticalPoint: (value) => {
        return translateUi('stat_crit_tooltip') + [20, 100, 500].map((res) => '\n' + translateUi('stat_crit_amount_tooltip', `<b>${(criticalChance(value, res) * 100).toFixed(2)}%</b>`, res)).join('')
    },
    DefensePower: (value) => {
        return translateUi('stat_defense_tooltip', `<b>${((1 - defMitigation(value)) * 100).toFixed(2)}%</b>`);
    },
    StabilityPoint: (value) => {
        return translateUi('stat_stability_tooltip', `<b>${(stabilityMinimum(value, props.characterStats.calculatedStats.value.StabilityRate.total ?? 2000) * 100).toFixed(2)}</b>%`);
    }
}

const statRows = computed(() => {
    return props.statList.length ? props.statList : Object.keys(props.characterStats.calculatedStats.value);
});
const columnClass = 'col-' + parseInt(12 / props.columns)

</script>

<template>
    <div class="row g-0">
        <div v-for="stat in statRows" :class="columnClass">
            <div :class="'stat-' + stat" class="d-flex align-items-center">
                <span class="stat-icon"><img class="invert-light" :src="`/images/staticon/Stat_${stat.split('_')[0]}.png`"></span>
                <span class="stat-name">{{ translate('Stat', stat.split('_')[0]) }}</span>
                <span class="flex-fill"></span>
                <template v-if="enableDerivedTooltip && derivedStats[stat]">
                    <span class="stat-value has-tooltip" v-tooltip="derivedStats[stat](characterStats.calculatedStats.value[stat].total)">
                        {{ characterStats.calculatedStats.value[stat].totalStr }}
                    </span>
                </template>
                <template v-else>
                    <span class="stat-value">
                        {{ stat == 'AmmoCount' && hideAmmoCount ? '-' : characterStats.calculatedStats.value[stat].totalStr }}
                    </span>
                </template>

            </div>
        </div>
    </div>
</template>