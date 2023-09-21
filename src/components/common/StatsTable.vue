<script setup>
import { computed } from "vue";
import { translate } from '../../composables/Localization';

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
    }
})

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
                <span class="stat-value">
                    {{ props.characterStats.calculatedStats.value[stat].totalStr }}
                </span>
            </div>
        </div>
    </div>
</template>