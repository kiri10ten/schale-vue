<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '../../stores/SettingsStore';
import { capitalize } from 'lodash';
import { regionSettings } from '../../composables/RegionSettings';

const props = defineProps({
    craftNode: {
        type: Object,
        required: true
    },
    language: String,
    noLink: Boolean,
    showChance: Boolean,
})

const settingsStore = useSettingsStore();

const smallText = {'En':8, 'Jp':4, 'Kr':4, 'Tw':4, 'Cn': 4, 'Zh': 4, 'Th': 8, 'Vi': 8}

const label = computed(() => {
    const language = props.language ?? (props.craftNode[`Name${settingsStore.languageProp}`] ? settingsStore.languageProp : 'Jp');
    return { text: props.craftNode[`Name${language}`], language };
})

const appearChance = computed(() => {
    return `${+(props.craftNode[`Chance${regionSettings.value.ServerName}`] * 100).toFixed(2)}%`;
})

</script>

<template>
    <component :is="noLink ? 'div' : 'RouterLink'" :to="{name: 'craftingview', params: {nodeid: craftNode.Id }}" class="selection-grid-card card-craft">
        <div class="card-img ba-craft-node">

            <div class="craft-image">
                <img class="node-icon" :class="{rare: craftNode.Quality == 2}" :src="`/images/craftnode/${craftNode.Icon}.png`">
                <img class="node-border" :src="`/images/craftnode/Node_Border.png`">
            </div>
        </div>
        <div v-if="showChance" class="card-badge stage-droprate">{{appearChance}}</div>
        <div class="card-label">
            <span class="label-text" :class="{smalltext: label.text.length > smallText[label.language]}">{{label.text}}</span>
        </div>
    </component>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.craft-image {
    position: relative;

    img.node-border {
        position: absolute;
        left: 0;
        top: 0;
    }
}

</style>