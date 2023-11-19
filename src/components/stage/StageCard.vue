<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '../../stores/SettingsStore';
import { translate } from '../../composables/Localization';


const props = defineProps({
    stage: {
        type: Object,
        required: true
    },
    noLink: Boolean,
})

const smallTextCharacters = {'en':12, 'jp':6, 'kr':8, 'tw':6, 'cn':6, 'zh':6, 'th': 12, 'vi': 12};

const settings = useSettingsStore().settings;

const cardName = computed(() => {
    return props.stage.Title ?? props.stage.Name;
})

const backgroundPath = computed(() => {
    switch (props.stage.Category) {
        case "Event":
            return `Campaign_Event_${props.stage.EventId > 10000 ? props.stage.EventId - 10000 : props.stage.EventId}_${props.stage.Difficulty == 2 ? 'Hard' : 'Normal'}`;
        case "Campaign":
            return `Campaign_Image_${props.stage.Area.toString().padStart(2,'0')}_${props.stage.Difficulty == 1 ? 'Hard' : 'Normal'}`;
        case "WeekDungeon":
            return `WeekDungeon_Image_${props.stage.Type}`;
        case "SchoolDungeon":
            return `SchoolDungeon_Image_${props.stage.Type}`;
    }
})

const route = computed(() => {
    if (props.stage.Category == 'Event') {
        return {name: `eventStageView`, params: {eventid: props.stage.EventId, stageid: props.stage.Id}};
    } else {
        return {name: `stageview`, params: {stageid: props.stage.Id}};
    }
})

</script>

<template>
    <component :is="noLink ? 'div' : 'RouterLink'" :to="route" class="selection-grid-card card-stage">
        <div class="card-img">
            <img loading="lazy" :src="`/images/campaign/${backgroundPath}.png`">
        </div>
        <div class="card-label">
            <span class="label-text" :class="{smalltext: cardName.length > smallTextCharacters[settings.language]}">{{ cardName }}</span>
        </div>
    </component>
</template>

<style scoped lang="scss">

.selection-grid-card {
    cursor: pointer;
}

.icon-type {
    border-radius: 999px !important;

    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 3px;

    img {
        width: 14px;
        height: 14px;
    }
}

</style>