<script setup>
import { computed, toRefs } from 'vue';
import { useStudentStore } from '../../stores/StudentStore';
import SkillPanel from './skills/SkillPanel.vue';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { useSettingsStore } from '../../stores/SettingsStore';
import { useStudentBondStats, useWeaponStats } from '../../composables/CharacterStats';
import StatsTable from '../common/StatsTable.vue';
import { useGiftsByStudent } from '../../composables/StudentGifts';
import ItemIcon from '../common/ItemIcon.vue';
import { getFurnitureById } from '../../composables/Furniture';
import Tooltip from '../common/Tooltip.vue';

const studentDisplay = useStudentStore().studentDisplay;
const refStudentDisplay = toRefs(studentDisplay);
const settings = useSettingsStore().settings;

const props = defineProps({
    student: {
        type: Object,
        required: true
    }
});

const bondStats = useStudentBondStats(computed(() => {return props.student}), refStudentDisplay.BondLevelDisplay, false);

const gifts = useGiftsByStudent(props.student);

const lobbyTooltip = computed(() => {
    return {
        title: translateUi('memory_lobby_student', props.student.Name),
        body: translateUi('memory_lobby_unlock', props.student.MemoryLobby[settings.server], props.student.Name) + '\n' + translateUi('memory_lobby_bgm', props.student.MemoryLobbyBGM)
    }
})

</script>

<template>
    <div class="d-flex flex-row align-items-top">
        <img id="ba-profile-portrait-img" class="drop-shadow me-3" :src="`/images/student/collection/${student.Id}.webp`">
        <div>
            <div class="my-1">
                <h3 id="ba-student-fullname" class="d-inline">{{ student.FamilyName }} {{ student.PersonalName }}</h3>
            </div>

            <div class="d-flex flex-column">
                <div class="d-flex gap-1">
                    <span id="ba-profile-school-label">{{ translate('SchoolLong', student.School) }}</span>
                    <span v-if="student.SchoolYear" id="ba-profile-schoolyear-label">{{ student.SchoolYear }}</span>
                </div>
                <span id="ba-profile-club-label">{{ translate('Club', student.Club) }}</span>
            </div>
        </div>

    </div>
    <table class="table ba-panel ba-stats mt-3 mb-2">
        <tbody>
            <tr>
                <td width="50%">
                    <div class="d-flex align-items-top justify-content-between">
                        <span>{{ translateUi('cv') }}</span>
                        <span class="ms-2 text-bold text-end">{{ student.CharacterVoice }}</span>
                    </div>
                </td>
                <td width="50%">
                    <div class="d-flex align-items-top justify-content-between">
                        <span>{{ translateUi('birthday') }}</span>
                        <span class="ms-2 text-bold text-end">{{ student.Birthday }}</span>
                    </div>
                </td>
            </tr>
            <tr>
                <td width="50%">
                    <div class="d-flex align-items-top justify-content-between">
                        <span>{{ translateUi('age') }}</span>
                        <span class="ms-2 text-bold text-end">{{ student.CharacterAge }}</span>
                    </div>
                </td>
                <td width="50%">
                    <div class="d-flex align-items-top justify-content-between">
                        <span>{{ translateUi('height') }}</span>
                        <span class="ms-2 text-bold text-end">{{ student.CharHeightMetric + ` (${student.CharHeightImperial})` }}</span>
                    </div>
                </td>
            </tr>
            <tr>
                <td width="50%">
                    <div class="d-flex align-items-top justify-content-between">
                        <span>{{ translateUi('designer') }}</span>
                        <span class="ms-2 text-bold text-end">{{ student.Designer }}</span>
                    </div>
                </td>
                <td width="50%">
                    <div class="d-flex align-items-top justify-content-between">
                        <span>{{ translateUi('illustrator') }}</span>
                        <span class="ms-2 text-bold text-end">{{ student.Illustrator }}</span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <div class="d-flex align-items-top justify-content-between">
                        <span>{{ translateUi('hobbies') }}</span>
                        <span class="ms-2 text-bold text-end">{{ student.Hobby }}</span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <div class="ba-panel-separator"></div>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <p>{{ student.ProfileIntroduction }}</p>
                    <p v-if="student.CharacterSSRNew" class="text-bold text-italic mb-0">{{ `"${student.CharacterSSRNew}"` }}</p>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="mt-3">
        <h5 class="text-bold">{{ translateUi('bond_title') }}</h5>
    </div>

    <div class="row g-1 my-1">
        <div class="d-flex flex-row">
            <div class="flex-grow-1">
                <div id="ba-bond-stat-table" class="ba-panel ba-stats mb-2">
                    <StatsTable :character-stats="bondStats"></StatsTable>
                </div>
                <div class="d-flex flex-row align-items-center">
                    <input v-model.number="studentDisplay.BondLevelDisplay" type="range" class="form-range me-2 flex-fill" :min="1" :max="regionSettings.BondMaxLevel">
                    <span class="ba-slider-label">
                        <span id="ba-bond-level"><fa icon="heart" class="me-1" />{{ studentDisplay.BondLevelDisplay }}</span>
                    </span>
                </div>
            </div>
            <Tooltip v-if="student.MemoryLobby[settings.server]" v-bind="lobbyTooltip" class="ba-student-lobby ms-3 drop-shadow">
                <img id="ba-student-lobby-img" :src="`/images/student/lobby/${student.Id}.webp`">
                <span id="ba-student-lobby-unlock" class="unselectable">{{ student.MemoryLobby[settings.server] }}</span>
            </Tooltip>
        </div>
    </div>
    <div class="mt-3">
        <h5 class="text-bold">{{ translateUi('favoritem_title') }}</h5>
    </div>
    <div class="my-1 p-2 item-icon-list ba-panel">
        <template v-for="i in 3">
            <ItemIcon v-for="gift in gifts[5-i]" :item-type="'Item'" :item-id="gift" :icon-label="`/images/ui/Cafe_Interaction_Gift_0${5-i}.png`" />
        </template>
        <p v-if="gifts[4].length == 0 && gifts[3].length == 0 && gifts[2].length == 0" class="m-0 text-center">{{ translateUi('favoritem_none') }}</p>
    </div>
    <div class="mt-3">
        <h5 class="text-bold">{{ translateUi('furniture_title') }}</h5>
    </div>
    <div class="my-1 p-2 item-icon-list ba-panel">
        <ItemIcon v-for="furniture in student.FurnitureInteraction[settings.server]" :item-type="'Furniture'" :item-id="furniture[0]" />
        <p v-if="student.FurnitureInteraction[settings.server].length == 0" class="m-0 text-center">{{ translateUi('furniture_none') }}</p>
    </div>
</template>

<style>

tbody {
    --bs-table-bg: initial;
    --bs-table-color: initial;
}

</style>