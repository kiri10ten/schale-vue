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

    return list;
}) 

</script>

<template>

    <div class="d-flex gap-3" :class="{'sidebar': sidebarMode}">
        <div class="flex-fill">
            <div class="p-3 card" :class="{'screen-height': sidebarMode}">
                <div class="card-header">
                    <nav class="nav nav-pills justify-content-center">
                        <button v-for="raidType in types" class="nav-link" :class="{active: tab == raidType}" @click="tab = raidType">
                            {{ translate('StageType', raidType) }}
                        </button>
                    </nav>
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