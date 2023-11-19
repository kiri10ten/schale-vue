<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '../../stores/SettingsStore';
import { translate } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';


const props = defineProps({
    event: {
        type: Object,
        required: true
    },
    noLink: Boolean,
})

const noLogo = ['zh', 'vi', 'cn'];
const smallTextCharacters = {'en':19, 'jp':10, 'kr':11, 'tw':10, 'cn':10, 'zh':10, 'th': 20, 'vi': 20};

const settingsStore = useSettingsStore();

const cardName = computed(() => {
    return translate('EventName', props.event.Id);
})

const logoPath = computed(() => {
    if (settingsStore.settings.server == 0 || !regionSettings.value.Events.includes(props.event.Id)) {
        return `${props.event.Id}_Jp`;
    } else {
        if (noLogo.includes(settingsStore.settings.language)) {
            return `${props.event.Id}_Jp`;
        } else {
            return `${props.event.Id}_${settingsStore.languageProp}`;
        }
    }
    
})


</script>

<template>
    <component :is="noLink ? 'div' : 'RouterLink'" :to="{name: 'eventview', params: { 'eventid': event.Id }}" class="selection-grid-card card-event">
        <div class="card-bg">
            <div :style="{backgroundImage: `url('/images/campaign/Campaign_Event_${event.Id}_Normal.png')`}"></div>
        </div>
        <div class="card-img">
            <img loading="lazy" :src="`/images/eventlogo/${logoPath}.webp`">
        </div>
        <div class="card-label">
            <span class="label-text" :class="{smalltext: cardName.length > smallTextCharacters[settingsStore.settings.language]}">{{ cardName }}</span>
        </div>
    </component>
</template>

<style scoped lang="scss">

</style>