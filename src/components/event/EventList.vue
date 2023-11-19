<script setup>
import { computed, ref } from 'vue';
import { eventGenerator } from '../../composables/Events';
import { regionSettings } from '../../composables/RegionSettings';
import { useSettingsStore } from '../../stores/SettingsStore';
import EventCard from './EventCard.vue';

const props = defineProps({
    selected: Object,
    sidebarMode: Boolean
})

const settings = useSettingsStore().settings;
const region = regionSettings;

const reverseSortOrder = ref(false);

const visibleEvents = computed(() => {

    const list = [];

    for (const event of eventGenerator()) {

        if (!region.value.Events.includes(Number(event.Id))) {
            continue;
        }

        list.push(event);

    }

    list.sort((a, b) => (a.Id - b.Id) * (reverseSortOrder.value ? -1 : 1))

    return list;
});

const sortOrderIcon = computed(() => {
    return reverseSortOrder.value ? 'arrow-up-1-9' : 'arrow-down-1-9';
});

</script>

<template>

    <div class="d-flex gap-3" :class="{'sidebar': sidebarMode}">
        <div class="flex-fill">
            <div :class="{'p-3 card screen-height': sidebarMode}">

                <div v-if="sidebarMode" class="d-flex px-2 pb-3 align-items-stretch">
                    <!-- <nav class="nav nav-pills flex-fill justify-content-center">
                        <button v-for="stageType in types" class="nav-link" :class="{active: tab == stageType}" @click="tab = stageType">
                            {{ translate('StageType', stageType) }}
                        </button>
                    </nav> -->
                    <button class="btn-pill" style="height:40px;" @click="reverseSortOrder = !reverseSortOrder">
                        <span class="label"><fa :icon="sortOrderIcon" class="mx-1" /></span>
                    </button>
                </div>
                <div v-else class="card-overlay p-2 mb-3">
                    <div class="d-flex gap-2 align-items-stretch">
                        <!-- <button class="btn-pill" data-bs-toggle="dropdown" data-bs-auto-close="true">
                            <span class="px-1 mx-2">{{ translate('StageType', tab) }}<fa icon="caret-down" class="ms-2" /></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li v-for="stageType in types">
                                <button class="dropdown-item" :class="{active: tab == stageType}" @click="tab = stageType">
                                    {{ translate('StageType', stageType) }}
                                </button>
                            </li>
                        </ul> -->
                        <button class="btn-pill ms-auto" @click="reverseSortOrder = !reverseSortOrder">
                            <span class="label"><fa :icon="sortOrderIcon" class="mx-1" /></span>
                        </button>
                    </div>

                </div>


                <div class="card-body">
                    <div class="selection-grid event hover align-top flex-fill">
                        <EventCard v-for="event of visibleEvents" :key="event.Id" :event="event" />
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>

.card-overlay {
    position: sticky;
    top: 72px;
    z-index: 50;
}

</style>