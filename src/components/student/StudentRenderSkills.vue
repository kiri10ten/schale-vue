<script setup>
import { computed } from 'vue';
import { useStudentStore } from '../../stores/StudentStore';
import SkillPanel from './skills/SkillPanel.vue';
import { translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { useSettingsStore } from '../../stores/SettingsStore';

const skillDisplay = useStudentStore().studentDisplay.SkillDisplay;
const settings = useSettingsStore().settings;

const props = defineProps({
    student: {
        type: Object,
        required: true
    }
});

const exSkills = computed(() => {
    return props.student.Skills.filter((skill) => skill.SkillType == 'ex')
});

const exSkillMaterials = computed(() => {
    return { item: props.student.SkillExMaterial, amount: props.student.SkillExMaterialAmount };
});

const otherSkills = computed(() => {
    const skills = [];

    if (skillDisplay.ShowUpgrades && regionSettings.value.GearUnlocked && props.student.Gear.Released?.[settings.server]) {
        skills.push(props.student.Skills.find((skill) => skill.SkillType == 'gearnormal'))
    } else {
        skills.push(props.student.Skills.find((skill) => skill.SkillType == 'normal'))
    }

    if (skillDisplay.ShowUpgrades && regionSettings.value.WeaponUnlocked) {
        skills.push(props.student.Skills.find((skill) => skill.SkillType == 'weaponpassive'))
    } else {
        skills.push(props.student.Skills.find((skill) => skill.SkillType == 'passive'))
    }

    skills.push(props.student.Skills.find((skill) => skill.SkillType == 'sub'))
    
    return skills;
});

const otherSkillMaterials = computed(() => {
    return { item: props.student.SkillMaterial, amount: props.student.SkillMaterialAmount };
});

</script>

<template>
    <div class="d-flex flex-column gap-2">
        <div class="d-flex">
            <button id="skills-show-upgrades" class="btn-pill tooltip-button" :class="{deactivated: !skillDisplay.ShowUpgrades}" @click="skillDisplay.ShowUpgrades = !skillDisplay.ShowUpgrades">
                <span class="label">
                    <fa icon="square" class="off" />
                    <fa icon="square-check" class="on" />
                    <span class="ps-2">{{ translateUi('student_skills_upgrades') }}</span>
                </span>
            </button>
            <!-- <div class="flex-fill"></div>
            <button id="skill-show-details" class="btn-pill">
                <div class="d-flex align-items-center justify-content-center" style="width:28px;height:28px;"><i class="fa-solid fa-calculator"></i></div>
                <span class="label ps-0">
                    <span data-localize-id="ui,calculations"></span>
                </span>
            </button> -->
        </div>

        <SkillPanel class="mb-2" :skills="exSkills" v-model:skill-level="skillDisplay.Ex" :materials="exSkillMaterials" :bullet-type="student.BulletType" :max-level="5"></SkillPanel>
        <SkillPanel :skills="otherSkills" v-model:skill-level="skillDisplay.PublicPassiveSub" :materials="otherSkillMaterials" :bullet-type="student.BulletType" :max-level="10"></SkillPanel>

    </div>

</template>