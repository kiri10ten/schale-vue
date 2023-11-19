<script setup>
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';
import { computed, inject, nextTick, ref, watch } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { shortDateFromTimestamp } from '../../composables/Utilities';
import { useSettingsStore } from '../../stores/SettingsStore';
import StageCard from '../stage/StageCard.vue';
import StageRender from '../stage/StageRender.vue';
import { eventStageGenerator, getConquestMapById, getConquestStageById, getDefaultConquestStage, getEventStageById } from '../../composables/Events';
import ConquestMap from './ConquestMap.vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    event: {
        type: Object,
        required: true
    },
    version: String
})

const route = useRoute();
const router = useRouter();

const useThreeCol = inject('useThreeCol');

const stageInfoEl = ref(null);
const visibleEventStages = computed(() => {

const stageList = [];

    for (const stage of eventStageGenerator(props.event.Id)) {
        if (stage.Versions.includes(props.version)) {
            stageList.push(stage);
        }
    }

    return stageList;
})

const conquestMap = computed(() => {
    return getConquestMapById(props.event.Id);
})

const defaultStage = computed(() => {
    if (visibleEventStages.value.length) {
        return visibleEventStages.value[0].Id;
    } else if (conquestMap.value) {
        return getDefaultConquestStage(props.event.Id).Id;
    } else {
        return 0;
    }
})

function redirectDefaultStage() {
    if (!route.params.stageid && defaultStage.value) {
        router.replace({name: 'eventStageView', params: {eventid: props.event.Id, stageid: defaultStage.value}});
    }
}

redirectDefaultStage();

const renderStage = computed(() => {
    if (conquestMap.value) {
        return getConquestStageById(route.params.stageid) ?? null;
    } else {
        return getEventStageById(route.params.stageid, props.version) ?? null;
    }
})

function setConquestTile(id) {
    selectedStage.value = id;
}

// watch(() => props.event, (newVal) => {
//     redirectDefaultStage();
// })

watch(() => route.params.stageid, () => {
    if (route.name == 'eventStageView') {
        redirectDefaultStage();
    }    
});

</script>

<template>

    <div class="d-flex" :class="{'flex-column gap-2': !useThreeCol}">

        <div class="column-half px-2" :class="{'col-50': useThreeCol}">
            <div v-if="visibleEventStages.length" class="ba-panel p-3 selection-grid selection-grid-flex stage" :class="{'sticky': useThreeCol}">
                <StageCard v-for="stage in visibleEventStages" :key="stage.Id" :stage="stage" />
            </div>

            <div v-if="conquestMap" class="ba-panel map-wrapper p-2" :class="{'sticky': useThreeCol}">
                <ConquestMap v-if="conquestMap" :conquest-map="conquestMap" :selected-tile="route.params.stageid" @select-tile="setConquestTile" />
            </div>
        </div>

        <div class="column-half" :class="{'col-50': useThreeCol}" ref="stageInfoEl">
            <StageRender class="" v-if="renderStage" :stage="renderStage" force-vertical />
        </div>

    </div>

</template>

<style scoped lang="scss">

.column-half {
    
    width: 100%;

    &.col-50 {
        width: 50%;
    }

    .sticky {
        position: sticky;
        top: 72px;
    }
    
}

.map-wrapper {
    position: relative;
}

</style>