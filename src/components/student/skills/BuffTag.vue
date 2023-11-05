<script setup>
import { computed } from 'vue';
import { translate } from '../../../composables/Localization';
import Tooltip from '../../common/Tooltip.vue';


const props = defineProps({
    name: String,
    label: String,
    noTooltip: Boolean
});

const type = computed(() => props.name.split('_')[0])

const tooltip = computed(() => {
    return {
        title: translate('BuffNameLong', props.name),
        subtitle: translate('BuffType', type.value),
        icon: `/images/buff/${props.name}.webp`,
        body: translate('BuffTooltip', props.name),
        iconSize: [30, 30]        
    }
})

</script>

<template>
    <component :is="noTooltip ? 'span' : Tooltip" v-bind="tooltip" :class="`ba-skill-${type.toLowerCase()}`">
        <img class="buff-icon" :src="`/images/buff/${name}.webp`">
        <span class="buff-label">{{ label ?? translate('BuffName', `${name}`) }}</span>
    </component>
</template>

<style scoped lang="scss">

.conflict {
    filter: grayscale(1);
    text-decoration: line-through;
}

</style>