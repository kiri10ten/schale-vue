<script setup>
import { computed } from 'vue';
import RaidSkillPanelItem from './RaidSkillPanelItem.vue';

const props = defineProps({
    skills: {
        type: Array,
        required: true
    },
    raidDifficulty: {
        type: Number,
        required: true
    }
});

const visibleSkills = computed(() => {
    return props.skills.filter((skill) => {
        if (skill.ShowInfo == false) {
            return false;
        }

        if (skill.MinDifficulty && props.raidDifficulty < skill.MinDifficulty) {
            return false;
        }

        if (skill.MaxDifficulty && props.raidDifficulty > skill.MaxDifficulty) {
            return false;
        }

        return true;

    });
})

</script>

<template>
<div>
    <div class="d-flex flex-column gap-2">
        <div class="p-2 pb-0 d-flex flex-column ba-panel align-items-start">
            <template v-for="(skill, i) in visibleSkills" :key="skill.Id">
                <div v-if="i > 0" class="ba-panel-separator mb-2"></div>
                <RaidSkillPanelItem :skill="skill" :raid-difficulty="raidDifficulty" />
            </template>
        </div>
    </div>
</div>
</template>

<style>

.plus-icon {
    background-color: inherit;
    color: #ffffff;

    position: absolute;
    right: -4px;
    top: 2px;

    width: 20px;
    height: 20px;

    border-radius: 999px !important;
    padding: 1px;
    box-sizing: border-box !important;

    font-weight: 900;
    line-height: 16px;
    font-size: 16px;
    text-align: center;
}

</style>