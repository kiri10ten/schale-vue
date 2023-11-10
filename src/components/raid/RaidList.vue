<script setup>
import { computed, ref } from 'vue';
import { raidGenerator, timeAttackGenerator, worldRaidGenerator } from '../../composables/Raids';
import { useSettingsStore } from '../../stores/SettingsStore';
import RaidCard from './RaidCard.vue';
import { translate } from '../../composables/Localization';
import TimeAttackCard from './TimeAttackCard.vue';

const props = defineProps({
    selected: Object,
    sidebarMode: Boolean
})

const settings = useSettingsStore().settings;

const types = ['Raid', 'TimeAttack', 'WorldRaid'];

const tab = ref(props.selected.type ?? 'Raid');
const reverseSortOrder = ref(false);

const visibleRaids = computed(() => {

    const list = [];

    if (tab.value == 'Raid') {
        for (const raid of raidGenerator()) {
            if (raid.IsReleased[settings.server]) {
                list.push(raid);
            }
        }
    } else if (tab.value == 'WorldRaid') {
        for (const raid of worldRaidGenerator()) {
            if (raid.IsReleased[settings.server]) {
                list.push(raid);
            }
        }
    } else if (tab.value == 'TimeAttack') {
        for (const raid of timeAttackGenerator()) {
            if (raid.IsReleased[settings.server]) {
                list.push(raid);
            }
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
                        <button v-for="raidType in types" class="nav-link" :class="{active: tab == raidType}" @click="tab = raidType">
                            {{ translate('StageType', raidType) }}
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
                            <li v-for="raidType in types">
                                <button class="dropdown-item" :class="{active: tab == raidType}" @click="tab = raidType">
                                    {{ translate('StageType', raidType) }}
                                </button>
                            </li>
                        </ul>

                        <button class="btn-pill ms-auto" @click="reverseSortOrder = !reverseSortOrder">
                            <span class="label"><fa :icon="sortOrderIcon" class="mx-1" /></span>
                        </button>
                    </div>
                </div>

                <div class="card-body">
                    <div v-if="tab == 'Raid'" id="raid-select-grid" class="selection-grid raid hover align-top flex-fill">
                        <RaidCard v-for="raid of visibleRaids" :raid="raid" :type="tab" />
                    </div>
                    <div v-if="tab == 'WorldRaid'" id="raid-select-grid" class="selection-grid raid hover align-top flex-fill">
                        <RaidCard v-for="raid of visibleRaids" :raid="raid" :type="tab" />
                    </div>
                    <div v-if="tab == 'TimeAttack'" id="raid-select-grid" class="selection-grid raid hover align-top flex-fill">
                        <TimeAttackCard v-for="raid of visibleRaids" :time-attack="raid" />
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