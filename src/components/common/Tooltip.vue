<script setup>
import { Tooltip } from 'bootstrap';
import { onMounted, onUnmounted, onUpdated, ref } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: String,
    icon: String,
    rarity: String,
    body: String,
    iconSize: {
        type: Array,
        default: [50, 50],
    },
    iconClass: {
        type: String,
        default: '',
    },
    placement: {
        type: String,
        default: 'top'
    }
});

const bsTooltip = ref(null);

const element = ref(null);
const tooltip = ref(null);

onMounted(() => {
    hookTooltip(element.value, tooltip.value);
})

onUpdated(() => {
    bsTooltip.value.dispose();
    hookTooltip(element.value, tooltip.value);
})

onUnmounted(() => {
    bsTooltip.value.dispose();
})

function hookTooltip(element, tooltip) {
    bsTooltip.value = new Tooltip(element, {
        title: tooltip,
        html: true,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
        placement: props.placement
    });

    tooltip.remove();
}



</script>

<template>
    <div ref="element">
        <slot></slot>
        <div ref="tooltip">
            <div class='ba-tooltip'>
                <div class='ba-tooltip-header'>
                    <div v-if="icon" class='ba-tooltip-img'>
                        <img :class='iconClass' :src='icon' :width='iconSize[0]' :height='iconSize[1]'>
                    </div>
                    <div class='flex-fill d-flex flex-column align-items-stretch'>
                        <div class='flex-fill d-flex justify-content-start align-items-center'>
                            <div class='ba-tooltip-title'>{{ title }}</div>
                        </div>
                        <div v-if="subtitle || rarity" class='d-flex align-items-center mt-auto'>
                            <span v-if="subtitle" class='ba-tooltip-subtitle'>{{ subtitle }}</span>
                            <span v-if="rarity" class='ba-tooltip-rarity ms-auto text-bold'>
                                <fa v-if="rarity == 'N' || rarity == 'R' || rarity == 'SR' || rarity == 'SSR'" icon="circle" class="me-1" :class="`col-item-${rarity.toLowerCase()}`"></fa>
                                {{ rarity }}
                            </span>
                        </div>
                    </div>
                </div>
                <div v-if="body" class="ba-tooltip-body" v-html="body">
                </div>
            </div>
        </div>
    </div>

</template>