<script setup>
import { translate, translateUi } from '../../../composables/Localization';

import Collapse from '../../common/Collapse.vue';
import SkillText from './SkillText.vue';
import SkillTags from './SkillTags.vue';
import { ref } from 'vue';
import { upgradeSkillTypes } from '../../../composables/Skills';

const extraSkillsShow = ref(false);

const props = defineProps({
    skill: {
        type: Object,
        required: true
    },
    skillLevel: Number,
    type: String,
    bulletType: String,
    extraSkills: Array
});

const extraSkillsCollapse = ref(null);

</script>

<template>

    <div class="d-flex flex-row align-items-start gap-3">
        <div class="skill-icon bg-skill" :class="bulletType.toLowerCase()">
            <img :src="`/images/skill/${skill.Icon}.webp`">
            <fa v-if="upgradeSkillTypes.includes(type)" icon="plus" class="plus-icon" />
        </div>
        <div class="d-inline-block">
            <div>
                <h4 class="me-2 d-inline">{{ skill.Name }}</h4>
            </div>
            <div class="pt-1 position-relative d-flex gap-1">

                <SkillText v-if="type == 'Normal'" class="" :skill="skill" :skill-level="skillLevel" :bullet-type="bulletType" />

                <template v-else>
                    <span class="text-italic">{{ translate('SkillType', type) }}</span>
                    <template v-if="type == 'Ex'">
                        <span class="text-bold">・</span>
                        <span class="text-bold text-italic">COST:</span>
                        <span class="text-bold" :class="{[`ba-col-${bulletType.toLowerCase()}`]: skill.Cost[0] != skill.Cost[4]}">{{ skill.Cost[skillLevel - 1] }}</span>
                    </template>
                </template>

            </div>
        </div>
    </div>

    <SkillText v-if="type != 'Normal'" class="my-2 p-1" :skill="skill" :skill-level="skillLevel" :bullet-type="bulletType" />
    

    <div class="skill-extrainfo">
        <button v-if="extraSkills.length" class="ba-info-pill-s btn btn-dark" @click="extraSkillsShow = !extraSkillsShow">
            <span class="label">
                {{ translateUi('summon') }}
                <fa icon="angle-down" class="animate-transform ms-1" :class="{'fa-rotate-180': extraSkillsShow}"></fa>
            </span>
        </button>
        <SkillTags :skill="skill" />
    </div>

    <Collapse v-if="extraSkills.length" v-model:show="extraSkillsShow" class="w-100" ref="extraSkillsCollapse">
        <template v-for="extraSkill in extraSkills">

            <div class="ba-panel-separator"></div>
            <div class="ps-4">
                <div class="my-2 d-flex flex-row align-items-start gap-3 w-100">
                    <div class="skill-icon small bg-skill" :class="bulletType.toLowerCase()">
                        <img :src="`/images/skill/${extraSkill.Icon}.webp`"></div>
                    <div class="d-inline-block flex-fill">
                        <div>
                            <h5 class="me-2 d-inline" v-html="extraSkill.Name"></h5>
                        </div>
                        <div class="pt-1 d-flex gap-3 align-items-center flex-wrap justify-content-between">
                            <div class="position-relative">
                                <SkillText class="mb-1" :skill="extraSkill" :skill-level="extraSkill.SkillType == 'autoattack' ? 1 : skillLevel" :bullet-type="bulletType" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="skill-extrainfo">
                    <SkillTags :skill="extraSkill" />
                </div>
            </div>

        </template>
    </Collapse>


</template>