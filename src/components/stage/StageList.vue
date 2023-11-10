<script setup>
import { computed, ref } from 'vue';
import { campaignStageGenerator, schoolDungeonStageGenerator, weekDungeonStageGenerator } from '../../composables/Stages';
import { useSettingsStore } from '../../stores/SettingsStore';
import StageCard from './StageCard.vue';
import { translate } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';

const props = defineProps({
    selected: Object,
    sidebarMode: Boolean
})

const settings = useSettingsStore().settings;
const region = regionSettings;

const types = ['Campaign', 'Bounty', 'WeekDungeon', 'SchoolDungeon'];

const tab = ref('Campaign');
const reverseSortOrder = ref(false);

const visibleStages = computed(() => {

    const list = [];

    if (tab.value == 'Campaign') {
        for (const stage of campaignStageGenerator()) {

            if (stage.Area == 'A' && !region.value.CampaignExtra) {
                continue;
            }

            if (stage.Area > region.value.CampaignMax) {
                continue;
            }

            list.push(stage);
        }
    } else if (tab.value == 'WeekDungeon') {
        for (const stage of weekDungeonStageGenerator()) {

            if (stage.Type == 'Blood' || stage.Type == 'FindGift') {

                if (stage.Type == 'Blood' && stage.Stage > region.value.BloodMax) {
                    continue;
                }

                if (stage.Type == 'FindGift' && stage.Stage > region.value.FindGiftMax) {
                    continue;
                }

                list.push(stage);
            }
        }
    } else if (tab.value == 'Bounty') {
        for (const stage of weekDungeonStageGenerator()) {

            if (stage.Type.startsWith('Chaser')) {
                if (stage.Stage > region.value.ChaserMax) {
                    continue;
                }

                list.push(stage);
            }
        }
    } else if (tab.value == 'SchoolDungeon') {
        for (const stage of schoolDungeonStageGenerator()) {

            if (stage.Stage > region.value.SchoolDungeonMax) {
                continue;
            }

            list.push(stage);
        }
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
                    <nav class="nav nav-pills flex-fill justify-content-center">
                        <button v-for="stageType in types" class="nav-link" :class="{active: tab == stageType}" @click="tab = stageType">
                            {{ translate('StageType', stageType) }}
                        </button>
                    </nav>
                    <button class="btn-pill" style="height:40px;" @click="reverseSortOrder = !reverseSortOrder">
                        <span class="label"><fa :icon="sortOrderIcon" class="mx-1" /></span>
                    </button>
                </div>
                <div v-else class="card-overlay p-2 mb-3">
                    <div class="d-flex gap-2 align-items-stretch">
                        <button class="btn-pill" data-bs-toggle="dropdown" data-bs-auto-close="true">
                            <span class="px-1 mx-2">{{ translate('StageType', tab) }}<fa icon="caret-down" class="ms-2" /></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li v-for="stageType in types">
                                <button class="dropdown-item" :class="{active: tab == stageType}" @click="tab = stageType">
                                    {{ translate('StageType', stageType) }}
                                </button>
                            </li>
                        </ul>
                        <button class="btn-pill ms-auto" @click="reverseSortOrder = !reverseSortOrder">
                            <span class="label"><fa :icon="sortOrderIcon" class="mx-1" /></span>
                        </button>
                    </div>

                </div>


                <div class="card-body">
                    <div class="selection-grid stage hover align-top flex-fill">
                        <StageCard v-for="stage of visibleStages" :key="stage.Id" :stage="stage" :type="tab" />
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