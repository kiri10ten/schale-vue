<script setup>
import { computed } from 'vue';
import { getTimeAttackRule } from '../../composables/Raids';
import SkillText from '../student/skills/SkillText.vue';

const props = defineProps({
    rules: {
        type: Array,
        required: true
    }
});

const renderRules = computed(() => {
    const renderRules = [];

    for (const {Id, Parameters} of props.rules) {
        const rule = getTimeAttackRule(Id);

        renderRules.push({
            Id: Id,
            Name: rule.Name,
            Desc: rule.Desc,
            Icon: rule.Icon,
            Parameters: Parameters ?? []
        });
    }

    return renderRules;
})

</script>

<template>
<div>
    <div class="d-flex flex-column gap-2">
        <div class="p-2 pb-0 d-flex flex-column ba-panel align-items-start">
            <template v-for="(rule, i) in renderRules" :key="rule.Id">
                <div v-if="i > 0" class="ba-panel-separator mb-2"></div>
                <div class="d-flex flex-row align-items-start gap-3">
                    <img class="raid-skill-icon" :src="`/images/timeattack/${rule.Icon}.webp`">
                    <div class="d-flex flex-column gap-2">
                        <h4 class="mb-0">{{ rule.Name }}</h4>
                        <SkillText :skill="rule" :skill-level="1" />
                    </div>
                </div>
            </template>
        </div>
    </div>
</div>
</template>

<style>

</style>