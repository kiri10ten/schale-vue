<script setup>
import { computed, toRefs } from 'vue';
import { useStudentStore } from '../../stores/StudentStore';
import SkillPanel from './skills/SkillPanel.vue';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { useSettingsStore } from '../../stores/SettingsStore';
import { useWeaponStats } from '../../composables/CharacterStats';
import StatsTable from '../common/StatsTable.vue';
import { terrainUpgradeText } from '../../composables/TerrainHelper';

const studentDisplay = useStudentStore().studentDisplay;
const refStudentDisplay = toRefs(studentDisplay);
const adaptationGrade = {0: "D", 1: "C", 2: "B", 3: "A", 4: "S", 5: "SS"};

const props = defineProps({
    student: {
        type: Object,
        required: true
    }
});

const weaponPassiveSkills = computed(() => {
    return props.student.Skills.filter((skill) => skill.SkillType == 'weaponpassive')
});

const weaponStats = useWeaponStats(computed(() => {return props.student.Weapon}), refStudentDisplay.WeaponLevelDisplay);

const weaponStatsList = computed(() => {

    const statsList = ['AttackPower', 'MaxHP'];

    if (props.student.Weapon.HealPower100 > 0) {
        statsList.push('HealPower')
    }
    return statsList;

})

</script>

<template>
    <div class="d-flex flex-row align-items-center px-1">
        <span class="flex-grow-1">
            <h3 id="ba-student-weapon-name">{{ student.Weapon.Name }}</h3>
        </span>
        <span class="me-1">
            <img src="/images/ui/Common_Icon_CharacterWeapon_off.png" style="height: 28px; width:auto;">
        </span>
        <h4 class="d-inline-block mb-0 text-italic">{{ student.WeaponType }}</h4>
    </div>
    <div class="ba-panel ba-stats mt-2">
        <img id="ba-student-weapon-img" class="p-2" :src="`/images/weapon/${student.WeaponImg}.webp`">
        <StatsTable :character-stats="weaponStats" :stat-list="weaponStatsList"></StatsTable>
        <div id="ba-weapon-stat-table">

        </div>
        <p class="mb-0 p-2" id="ba-weapon-description">{{ student.Weapon.Desc }}</p>
    </div>

    <div class="row g-1 my-3">
        <div class="d-flex flex-row align-items-center">
            <input v-model.number="studentDisplay.WeaponLevelDisplay" type="range" class="form-range me-2 flex-fill" :min="1" :max="regionSettings.WeaponMaxLevel">
            <span class="ba-slider-label">{{ 'Lv.' + studentDisplay.WeaponLevelDisplay }}</span>
        </div>
    </div>

    <ul class="nav nav-pills justify-content-left">
        <li class="nav-item ba-weapon-rank-tab">
            <a class="nav-link active text-bold" data-bs-toggle="tab" href="#weapon-2star"><fa icon="star" class="me-1" />2</a>
        </li>
        <li class="nav-item ba-weapon-rank-tab">
            <a class="nav-link text-bold" data-bs-toggle="tab" href="#weapon-3star"><fa icon="star" class="me-1" />3</a>
        </li>
    </ul>

    <div class="tab-content">

        <div id="weapon-2star" class="tab-pane show active">

            <div class="d-flex flex-row align-items-end my-3">
                <span class="flex-grow-1">
                    <p class="d-inline" v-html="translateUi('student_weapon_rank_2star_desc')"></p>
                </span>
            </div>

            <SkillPanel :skills="weaponPassiveSkills" v-model:skill-level="studentDisplay.SkillDisplay.WeaponPassive" :bullet-type="student.BulletType" :max-level="10"></SkillPanel>

        </div>

        <div id="weapon-3star" class="tab-pane">

            <div class="d-flex flex-row align-items-end mt-3">
                <span class="flex-grow-1">
                    <p class="d-inline" v-html="translateUi('student_weapon_rank_3star_desc')"></p>
                </span>
            </div>

            <div class="mt-3 p-2 d-flex flex-row align-items-center ba-panel">
                <div class="position-relative">
                    <div class="d-inline-block" style="margin-bottom: 24px; margin-right: calc(28px + 1rem);background-color: var(--col-theme-accent);border-radius: 0.25rem;">
                        <img id="ba-weapon-bonus-terrain-type" class="invert-light" style="height:48px; width: 48px;" :src="`/images/ui/Terrain_${student.Weapon.AdaptationType}.png`">
                    </div>
                    <img class="d-inline-block position-absolute" style="height:48px; width: auto; top: 22px; left: 28px;" :src="`/images/ui/Adaptresult${student[student.Weapon.AdaptationType+'BattleAdaptation'] + student.Weapon.AdaptationValue}.png`">
                </div>
                <p v-html=" terrainUpgradeText(student.Weapon.AdaptationType, student[student.Weapon.AdaptationType+'BattleAdaptation'], student[student.Weapon.AdaptationType+'BattleAdaptation'] + student.Weapon.AdaptationValue)" class="m-0"></p>
            </div>

        </div>

    </div>

</template>