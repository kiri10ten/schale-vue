<script setup>
import { computed } from 'vue';
import CalculationBuffItem from './CalculationBuffItem.vue';

const props = defineProps({
    characterStats: {
        type: Object,
        required: true
    },
    personalSkills: {
        type: Array,
        required: true
    },
    characterDisplay: Object
});

const visibleSkills = computed(() => {
    return props.personalSkills.filter((s) => s.Effects.some((e) => e.Type == "Buff" && e.Target.includes('Self')));
})

function getDisplaySkillType(skillType) {
    if (skillType == 'WeaponPassive') {
        return 'Passive';
    } else if (skillType == 'GearPublic') {
        return 'Public';
    } else {
        return skillType;
    }
}

</script>

<template>

<h5>Personal Buffs</h5>
<div class="d-flex flex-column gap-3">

    <template v-for="skill in visibleSkills">
        <CalculationBuffItem
        :character-stats="characterStats"
        :skill="skill"
        effect-target="Self"
        v-model:enabled="characterDisplay.Skill[getDisplaySkillType(skill.Type)].Enabled"
        v-model:level="characterDisplay.Skill[getDisplaySkillType(skill.Type)].Level"
        />
    </template>

</div>

</template>