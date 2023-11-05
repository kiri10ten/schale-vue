<script setup>
import { translate } from '../../composables/Localization';
import SkillTags from '../student/skills/SkillTags.vue';
import SkillText from '../student/skills/SkillText.vue';

const props = defineProps({
    skill: {
        type: Object,
        required: true
    },
    raidDifficulty: Number
});

</script>

<template>

    <div class="d-flex flex-row align-items-start gap-3">
        <div class="raid-skill-icon">
            <img :src="`/images/raid/skill/${skill.Icon}.png`">
        </div>
        <div class="d-inline-block">
            <div>
                <h4 class="me-2 d-inline">{{ skill.Name }}</h4>
            </div>
            <div class="pt-1 position-relative d-flex gap-1 align-items-center">
                <span class="text-italic">{{ translate('SkillType', skill.SkillType) }}</span>
                <template v-if="skill.ATGCost">
                    <span class="mx-1">/</span>
                    <span class="font-nexon">ATG:</span>
                    <span class="atg ms-1 d-flex align-self-center">
                        <img v-for="n in skill.ATGCost" height="16" src="/images/ui/ATG.png">
                    </span>
                    
                </template>
            </div>
        </div>
    </div>

    <SkillText class="my-2 p-1"
                    :skill="skill"
                    :skill-level="raidDifficulty + 1"
                    emphasise-change />


    <SkillTags :skill="skill" />

</template>

<style scoped lang="scss">

.raid-skill-icon {

    img {
        height: 64px;
        width: 64px;
        object-fit: contain;
        object-position: center;
    }

}

.atg {
    padding-bottom: 2px;
}

</style>