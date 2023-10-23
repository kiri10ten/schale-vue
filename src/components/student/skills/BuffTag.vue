<script setup>
import { computed } from 'vue';
import { translate } from '../../../composables/Localization';
import Tooltip from '../../common/Tooltip.vue';


const props = defineProps({
    name: String,
    type: String,
    noTooltip: Boolean
});

const tooltip = computed(() => {
    return {
        title: translate('BuffNameLong', `${props.type}_${props.name}`),
        subtitle: translate('BuffType', props.type),
        icon: `/images/buff/${props.type}_${props.name}.webp`,
        body: translate('BuffTooltip', `${props.type}_${props.name}`),
        iconSize: [30, 30]        
    }
})

</script>

<template>
    <component :is="noTooltip ? 'span' : Tooltip" v-bind="tooltip" :class="`ba-skill-${type.toLowerCase()}`">
        <img class="buff-icon" :src="`/images/buff/${type}_${name}.webp`">
        <span class="buff-label">{{ translate('BuffName', `${type}_${name}`) }}</span>
    </component>
</template>