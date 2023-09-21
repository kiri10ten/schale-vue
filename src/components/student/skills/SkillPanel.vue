<script setup>
import { Collapse } from 'bootstrap';
import { computed, onMounted, onUpdated, ref } from 'vue';
import { translateUi } from '../../../composables/Localization';
import { abbreviateNumber } from '../../../composables/Utilities';

import ItemIcon from '../../common/ItemIcon.vue';
import SkillText from './SkillText.vue';
import { bindTooltips } from '../../../composables/Tooltips';

const upgradeCreditsEx = [80000, 500000, 3000000, 10000000];
const upgradeCreditsOther = [5000, 7500, 60000, 90000, 300000, 450000, 1500000, 2400000, 4000000];
const plusSkills = ['gearnormal', 'weaponpassive'];

const props = defineProps({
    skills: {
        type: Array,
        required: true
    },
    skillLevel: {
        type: Number,
        required: true
    },
    maxLevel: Number,
    bulletType: String,
    materials: Object
});

const materials = computed(() => {
    const materials = [];

    if (props.materials && props.skillLevel > 1) {

        if (props.skillLevel <= props.materials.item.length + 1) {

            props.materials.item[props.skillLevel - 2].forEach((item, index) => {
                materials.push({type: 'Item', id: item, amount: props.materials.amount[props.skillLevel - 2][index]})
            });

        }

        if (props.skillLevel == 10) {
            materials.push({type: 'Item', id: 9999, amount: 1})
        }

        materials.push({type: 'Currency', id: 1, amount: props.maxLevel == 5 ? upgradeCreditsEx[props.skillLevel - 2] : upgradeCreditsOther[props.skillLevel - 2]})

    }

    return materials;
});

const collapseButton = ref(null);
const collapseTarget = ref(null);

onMounted(() => {
    if (collapseTarget.value !== null && collapseButton.value !== null) {
        const collapse = new Collapse(collapseTarget.value, { toggle: false });
        collapseButton.value.addEventListener('click', () => collapse.toggle());
    }
});

const emit = defineEmits(['update:skillLevel']);

</script>

<template>
    <div class="d-flex flex-column gap-2">
        <div class="p-2 pb-0 d-flex flex-column ba-panel align-items-start">
            <template v-for="(skill, i) in skills">
                <div v-if="i > 0" class="ba-panel-separator mb-2"></div>

                <div class="d-flex flex-row align-items-center gap-3">
                    <div class="skill-icon bg-skill" :class="{[bulletType.toLowerCase()]: true}">
                        <img :src="`/images/skill/${skill.Icon}.webp`">
                        <fa v-if="plusSkills.includes(skill.SkillType)" icon="plus" class="plus-icon" />
                    </div>
                    <div class="d-inline-block">
                        <div>
                            <h4 class="me-2 d-inline">{{ skill.Name }}</h4>
                        </div>
                        <div class="pt-1 position-relative d-flex gap-1">
                            <span class="text-italic">{{ translateUi(`student_skill_${skill.SkillType}`) }}</span>
                            <template v-if="skill.SkillType == 'ex'">
                                <span class="text-bold">・</span>
                                <span class="text-bold text-italic">COST:</span>
                                <span class="text-bold" :class="{[`ba-col-${bulletType.toLowerCase()}`]: skill.Cost[0] != skill.Cost[4]}">{{ skill.Cost[skillLevel - 1] }}</span>
                            </template>

                        </div>
                    </div>
                </div>

                <SkillText class="my-2 p-1" :skill="skill" :skill-level="skillLevel" :bullet-type="bulletType" />
                
            </template>

            <div v-if="props.materials" ref="collapseTarget" class="collapse w-100">
                <div class="ba-panel-separator"></div>
                <div class="my-2 px-2">
                    <div class="item-icon-list">
                        <span v-if="materials.length == 0">{{ translateUi('student_skills_materials_none') }}</span>
                        <template v-if="materials.length">
                            <ItemIcon v-for="material in materials" :item-type="material.type" :item-id="material.id" :primary-label="'&times;' + abbreviateNumber(material.amount)" />
                        </template>
                    </div>
                </div>
            </div>

        </div>
        <div class="d-flex flex-row align-items-center gap-2">
            <button v-if="props.materials" class="btn-pill" ref="collapseButton">
                <span class="label">{{ translateUi('student_skills_materials') }}</span>
            </button>
            <input type="range" class="form-range flex-fill" @input="emit('update:skillLevel', $event.target.valueAsNumber)" :value="skillLevel" min="1" :max="maxLevel">
            <span class="ba-slider-label">
                <img v-if="skillLevel == maxLevel" :src="'/images/ui/ImageFont_Max.png'">
                <template v-if="skillLevel != maxLevel">{{ `Lv.${skillLevel}` }}</template>
            </span>
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