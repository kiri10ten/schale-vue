<script setup>
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';
import { ref, computed, inject, watch } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { setBackground, shortDateFromTimestamp } from '../../composables/Utilities';
import { useSettingsStore } from '../../stores/SettingsStore';
import { useRoute, useRouter } from 'vue-router';
import { getConquestMapById } from '../../composables/Events';
import DropdownList from '../common/DropdownList.vue';

const props = defineProps({
    event: {
        type: Object,
        required: true
    }
})

const route = useRoute();
const router = useRouter();

const versions = ['Original', 'Rerun', 'Permanent']
const noLogo = ['zh', 'vi', 'cn'];

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');
const useThreeCol = inject('useThreeCol');

const settingsStore = useSettingsStore();

const eventVersions = computed(() => {

    const list = [];

    for (const version of versions) {
        if (props.event[version] && props.event[version][`EventOpen${regionSettings.value.ServerName}`]) {

            const eventVersion = {};

            eventVersion['Version'] = version;
            eventVersion['Label'] = translateUi(`stage_${version.toLowerCase()}`);
            eventVersion['EventOpen'] = shortDateFromTimestamp(props.event[version][`EventOpen${regionSettings.value.ServerName}`]);

            if (version !== 'Permanent') {
                eventVersion['EventClose'] = shortDateFromTimestamp(props.event[version][`EventClose${regionSettings.value.ServerName}`]);
            }

            list.push(eventVersion);
        }
    }

    return list;
})

const availableVersions = computed(() => eventVersions.value.map(v => v.Version).filter(v => v != 'Permanent'));
const selectedVersion = ref(0);

const hasConquestMap = computed(() => {
    return getConquestMapById(props.event.Id) ? true : false;
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

function redirectView() {
    //setBackground(`/images/campaign/Campaign_Event_${props.event.Id}_Normal.png`);
    if (route.name == 'eventview') {
        router.replace({name: 'eventStageView', params: {eventid: props.event.Id}});
    }
}

redirectView();

watch(() => props.event, (newVal) => {
    redirectView();
})

</script>

<template>
    <div class="card h-100">
        <div class="d-flex h-100 flex-column gap-3 py-2">

            <div class="d-flex" :class="{'flex-column gap-3': !useThreeCol}">

                <div class="px-2 w-100 align-self-start flex-fill d-flex flex-column gap-3">

                    <div class="d-flex align-items-center gap-2">
                        <img width="180" height="60" class="align-self-start" :src="`/images/eventlogo/${logoPath}.webp`">
                        <h2 class="title-text px-1 mb-0">{{ translate('EventName', event.Id ) }}</h2>
                    </div>

                    <div class="ba-panel p-2 mt-2">
                        <div v-for="version of eventVersions">
                            {{ version.Label }}
                            <fa icon="calendar" class="ms-2" />
                            <i class="ms-1">
                                {{ version.EventOpen }}
                                <template v-if="version.EventClose">
                                    - {{ version.EventClose }}
                                </template>
                            </i>
                        </div>
                    </div>

                    <DropdownList :items="availableVersions" v-model:selected-index="selectedVersion">
                        <!-- <template #button="{ item }">
                            <span class="label">{{ version }}</span>
                        </template>
                        <template #itemList="version">
                            <span class="label">{{ version }}</span>
                        </template> -->
                    </DropdownList>
                </div>

            </div>

            <nav class="nav nav-pills justify-content-center px-2">
                <RouterLink class="nav-link" active-class="active" :to="{name: 'eventStageView', params: {eventid: route.params.eventid}}">
                    <template v-if="hasConquestMap">{{ translate('StageType', 'Conquest') }}</template>
                    <template v-else>{{ translateUi('event_stages') }}</template>
                </RouterLink>
                <!-- <button class="nav-link" :class="{active: activeTab == 'Shop'}" @click="activeTab = 'Shop'">
                    {{ translateUi('event_shop') }}
                </button> -->
            </nav>

            <RouterView v-slot="{ Component }">
                <component :is="Component" :event="event" :version="availableVersions[selectedVersion]"/>
            </RouterView>
            
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.card {
    
    padding: 0.5rem;

    @include md-down {
        border-radius: 0px;
        margin-bottom: 0;
        padding: 0.5rem 0;
    }
}


</style>