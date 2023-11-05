<script setup>
import { computed, toRef, toRefs } from 'vue';
import { useStudentBondStats } from '../../composables/Bond';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { useGiftsByStudent } from '../../composables/StudentGifts';
import { useSettingsStore } from '../../stores/SettingsStore';
import { useStudentStore } from '../../stores/StudentStore';
import ItemIcon from '../common/ItemIcon.vue';
import StatsTable from '../common/StatsTable.vue';

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

const gifts = useGiftsByStudent(toRef(props, 'student'));

</script>

<template>
    <div class="d-flex flex-row align-items-top">
        <img id="ba-profile-portrait-img" class="me-3" :src="`/images/student/collection/${student.Id}.webp`">
        <div>
            <div class="my-1">
                <h3 id="ba-student-fullname" class="d-inline">
                    <ruby v-if="settings.language === 'jp'">
                        {{ student.FamilyName }}
                        <rp>(</rp><rt>{{ student.FamilyNameRuby }}</rt><rp>)</rp>
                    </ruby>
                    <template v-else>{{ student.FamilyName }}</template>
                    {{ ' ' }}
                    <ruby v-if="settings.language === 'jp'">
                        {{student.PersonalName }}
                        <rp>(</rp><rt>{{ student.PersonalNameRuby }}</rt><rp>)</rp>
                    </ruby>
                    <template v-else>{{ student.PersonalName }}</template>               
                </h3>
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
                        <span class="ms-2 text-bold text-end">{{ student.CharHeightMetric + (student.CharHeightImperial ? ` (${student.CharHeightImperial})` : '')}}</span>
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
    <div v-if="student.MemoryLobby[settings.server]" class="ba-panel p-2 mt-3">
        <div class="d-flex gap-2">
            <div class="ba-student-lobby">
                <img id="ba-student-lobby-img" :src="`/images/student/lobby/${student.Id}.webp`">
                <span id="ba-student-lobby-unlock" class="unselectable">{{ student.MemoryLobby[settings.server] }}</span>
            </div>
            <div>
                <h5 class="text-bold mb-1">{{ translateUi('memory_lobby') }}</h5>
                <p class="mb-1">{{ translateUi('memory_lobby_unlock', student.MemoryLobby[settings.server], student.Name) }}</p>
                <p class="m-0"><fa icon="music" class="me-2"></fa><i>{{ translate('BGM', student.MemoryLobbyBGM) ?? `Theme ${student.MemoryLobbyBGM}` }}</i></p>
            </div>
        </div>

    </div>

    <div class="mt-3">
        <h5 class="text-bold">{{ translateUi('favoritem_title') }}</h5>
    </div>
    <div class="my-1 p-2 item-icon-list ba-panel">
        <ItemIcon v-for="gift in gifts" :item-type="'Item'" :item="gift.gift" :primary-label="''+gift.exp" :icon-label="`/images/ui/Cafe_Interaction_Gift_0${gift.grade}.png`" />
        <p v-if="!gifts.length" class="m-0 text-center">{{ translateUi('favoritem_none') }}</p>
        <!-- <template v-for="i in 3">
            <ItemIcon v-for="gift in gifts[5-i]" :item-type="'Item'" :item-id="gift" :primary-label="" :icon-label="`/images/ui/Cafe_Interaction_Gift_0${5-i}.png`" />
        </template>
        <p v-if="gifts[4].length == 0 && gifts[3].length == 0 && gifts[2].length == 0" class="m-0 text-center">{{ translateUi('favoritem_none') }}</p> -->
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

</style>