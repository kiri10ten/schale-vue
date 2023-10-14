<script setup>
import { computed, toRefs } from 'vue';
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
    return [{type: 'Ex', skill: props.student.Skills.Ex}]
});

const exSkillMaterials = computed(() => {
    return { item: props.student.SkillExMaterial, amount: props.student.SkillExMaterialAmount };
});

const otherSkills = computed(() => {
    const skills = [];

    if (skillDisplay.ShowUpgrades && regionSettings.value.GearUnlocked && props.student.Gear.Released?.[settings.server]) {
        skills.push({type: 'GearPublic', skill: props.student.Skills.GearPublic})
    } else {
        skills.push({type: 'Public', skill: props.student.Skills.Public})
    }

    if (skillDisplay.ShowUpgrades && regionSettings.value.WeaponUnlocked) {
        skills.push({type: 'WeaponPassive', skill: props.student.Skills.WeaponPassive})
    } else {
        skills.push({type: 'Passive', skill: props.student.Skills.Passive})
    }

    skills.push({type: 'ExtraPassive', skill: props.student.Skills.ExtraPassive})
    
    return skills;
});

const otherSkillMaterials = computed(() => {
    return { item: props.student.SkillMaterial, amount: props.student.SkillMaterialAmount };
});

</script>

<template>
    <div class="d-flex flex-column">
        <div class="d-flex mb-2">
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

        <SkillPanel class="mb-2"
            v-model:skill-level="skillDisplay.Ex"
            :skills="exSkills"
            :materials="exSkillMaterials"
            :bullet-type="student.BulletType"
            :max-level="5"
            v-model:materials-show="skillDisplay.ExShowMaterials"
            v-model:show-cumulative="skillDisplay.ExShowCumulative"/>
        <SkillPanel
            v-model:skill-level="skillDisplay.PublicPassiveSub"
            :skills="otherSkills"
            :materials="otherSkillMaterials"
            :bullet-type="student.BulletType"
            :max-level="10"
            v-model:materials-show="skillDisplay.PublicPassiveSubShowMaterials"
            v-model:show-cumulative="skillDisplay.PublicPassiveSubShowCumulative"/>
    </div>

</template>