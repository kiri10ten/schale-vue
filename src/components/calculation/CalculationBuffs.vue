<script setup>
import { ref, computed, reactive, toRefs } from 'vue';
import CalculationBuffItem from './CalculationBuffItem.vue';
import CalculationBuffAdd from './CalculationBuffAdd.vue';
import { getSkillSlot } from '../../composables/Skills';
import Collapse from '../common/Collapse.vue';
import { useStudentStore } from '../../stores/StudentStore';

const props = defineProps({
    character: {
        type: Object,
        required: true
    },
    characterStats: {
        type: Object,
        required: true
    },
    summon: Object,
    summonStats: Object,
    personalSkills: {
        type: Array,
        required: true
    },
    characterDisplay: Object,
});

const {character, summon} = toRefs(props);

const showPersonalSkills = ref(true);
const showOtherSkills = ref(true);
const showOtherSummonSkills = ref(true);

const studentStore = useStudentStore();

const visiblePersonalSkills = computed(() => {
    return props.personalSkills.filter((s) => s.Effects.some((e) => e.Type == "Buff" && e.Target.includes('Self')));
})

const activePersonalCount = computed(() => {
    return visiblePersonalSkills.value.filter(s => props.characterDisplay.Skill[getSkillSlot(s.Type)].Enabled).length;
})

const activeSkillCount = computed(() => {
    return studentStore.studentBuffs.filter(s => s.Enabled).length;
})

const activeSummonSkillCount = computed(() => {
    return studentStore.studentSummonBuffs.filter(s => s.Enabled).length;
})

function removeBuff(id, skillList) {
    
    const index = skillList.findIndex(s => s.Skill.Id == id);

    if (index !== -1) {
        skillList.splice(index, 1);
    }

    console.log('removed buff', id, skillList)
}

</script>

<template>

<div class="d-flex flex-column">
    <div class="d-flex gap-2 align-items-end mb-3 section-header" @click="showPersonalSkills = !showPersonalSkills">
        <h5 class="m-0">
            <fa icon="angle-down" class="me-1 animate-transform" :class="{'fa-rotate-180': showPersonalSkills}" />
            Personal Buffs
        </h5>
        <span class="ba-info-pill-s px-2 bg-theme">{{ activePersonalCount }} / {{ visiblePersonalSkills.length }}</span>     
    </div>

    <Collapse v-model:show="showPersonalSkills">
        <div class="d-flex flex-column mb-3 gap-3">
            <template v-for="skill in visiblePersonalSkills">
                <CalculationBuffItem
                :target-character="character"
                :character-stats="characterStats"
                :skill="skill"
                target-side="Self"
                v-model:enabled="characterDisplay.Skill[getSkillSlot(skill.Type)].Enabled"
                v-model:level="characterDisplay.Skill[getSkillSlot(skill.Type)].Level"
                />
            </template>
        </div>
    </Collapse>

    <div class="d-flex gap-2 align-items-end mb-3 section-header" @click="showOtherSkills = !showOtherSkills">
        <h5 class="m-0">
            <fa icon="angle-down" class="me-1 animate-transform" :class="{'fa-rotate-180': showOtherSkills}" />
            Other Buffs
            <small class="text-italic" v-if="summon">- {{ character.Name }}</small>
        </h5>
        <span class="ba-info-pill-s px-2 bg-theme">{{ activeSkillCount }} / {{ studentStore.studentBuffs.length }}</span>     
    </div>

    <Collapse v-model:show="showOtherSkills">
        <CalculationBuffAdd
            :selected-skills="studentStore.studentBuffs"
            :target-character="character"
        />
        <div class="d-flex flex-column mb-3 gap-3">
            <CalculationBuffItem
                v-for="skill in studentStore.studentBuffs"
                :key="skill.Skill.Id + skill.TargetSide"
                :target-character="character"
                :character-stats="characterStats"
                :skill="skill.Skill"
                :target-side="skill.TargetSide"
                v-model:enabled="skill.Enabled"
                v-model:level="skill.Level"
                removable
                @remove="(id) => removeBuff(id, studentStore.studentBuffs)"
            />
        </div>
    </Collapse>

    <template v-if="summon && summon.Id != 99999">
        <div class="d-flex gap-2 align-items-end mb-3 section-header" @click="showOtherSummonSkills = !showOtherSummonSkills">
            <h5 class="m-0">
                <fa icon="angle-down" class="me-1 animate-transform" :class="{'fa-rotate-180': showOtherSummonSkills}" />
                Other Buffs
                <small class="text-italic" v-if="summon">- {{ summon.Name }}</small>
            </h5>
            <span class="ba-info-pill-s px-2 bg-theme">{{ activeSummonSkillCount }} / {{ studentStore.studentSummonBuffs.length }}</span>     
        </div>

        <Collapse v-model:show="showOtherSummonSkills">
            <CalculationBuffAdd
                :selected-skills="studentStore.studentSummonBuffs"
                :target-character="summon"
            />
            <div class="d-flex flex-column mb-3 gap-3">
                <CalculationBuffItem
                v-for="skill in studentStore.studentSummonBuffs"
                :key="skill.Skill.Id + skill.TargetSide"
                :target-character="summon"
                :character-stats="summonStats"
                :skill="skill.Skill"
                :target-side="skill.TargetSide"
                v-model:enabled="skill.Enabled"
                v-model:level="skill.Level"
                removable
                @remove="(id) => removeBuff(id, studentStore.studentSummonBuffs)"
                />
            </div>
        </Collapse>

    </template>

</div>

</template>

<style scoped lang="scss">

.section-header {
    cursor: pointer;

    .ba-info-pill-s {
        cursor: pointer;
    }
}

</style>