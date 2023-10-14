<script setup>
import { Collapse } from 'bootstrap';
import { computed, onMounted, ref, toValue } from 'vue';
import { translateUi } from '../../../composables/Localization';
import { abbreviateNumber } from '../../../composables/Utilities';
import ItemIcon from '../../common/ItemIcon.vue';
import SkillPanelItem from './SkillPanelItem.vue';

const upgradeCreditsEx = [80000, 500000, 3000000, 10000000];
const upgradeCreditsOther = [5000, 7500, 60000, 90000, 300000, 450000, 1500000, 2400000, 4000000];

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
    materials: Object,
    materialsShow: {
        type: Boolean,
        default: false
    },
    showCumulative: {
        type: Boolean,
        default: false
    }
});

const materials = computed(() => {
    const materials = [];
    const items = {};

    if (props.materials && props.skillLevel > 1) {

        for (let level = 2; level <= props.skillLevel; level++) {

            if (!props.showCumulative && level != props.skillLevel) {
                continue;
            }

            props.materials.item[level - 2]?.forEach((item, index) => {
                if (items[item]) {
                    items[item] += props.materials.amount[level - 2][index];
                } else {
                    items[item] = props.materials.amount[level - 2][index];
                }
            });

            if (level == 10) {
                items[9999] = 1;
            }
            
        }

        for (const item in items) {
            materials.push({
                type: 'Item',
                id: +item,
                amount: items[item]
            });
        }

        materials.sort((a,b) => a.id - b.id);

    }

    return materials;
});

const credits = computed(() => {
    
    if (props.showCumulative) {

        let creditsTotal = 0;

        for (let level = 2; level <= props.skillLevel; level++) {
            creditsTotal += props.maxLevel == 5 ? upgradeCreditsEx[level - 2] : upgradeCreditsOther[level - 2]
        }

        return creditsTotal;
    } else {
        return (props.maxLevel == 5 ? upgradeCreditsEx[props.skillLevel - 2] : upgradeCreditsOther[props.skillLevel - 2]) ?? 0;
    }

})

const skillItems = computed(() => {

    const skills = [];

    for (const skillObj of props.skills) {
        const skill = {}
        skill.skill = skillObj.skill;
        skill.skillLevel = props.skillLevel;
        skill.type = skillObj.type;
        skill.bulletType = props.bulletType;
        skill.extraSkills = skillObj.extraSkills ?? [];

        skills.push(skill);

    }
    return skills;

});

const initialShow = toValue(props.materialsShow);

const collapseButton = ref(null);
const collapseTarget = ref(null);

const emit = defineEmits(['update:skillLevel', 'update:materialsShow', 'update:showCumulative']);

onMounted(() => {
    if (collapseTarget.value !== null && collapseButton.value !== null) {
        const collapse = new Collapse(collapseTarget.value, { toggle: false });
        collapseButton.value.addEventListener('click', () => {
            collapse.toggle();
        });

        collapseTarget.value.addEventListener('show.bs.collapse', (e) => {
            emit('update:materialsShow', true);
        });
        collapseTarget.value.addEventListener('hide.bs.collapse', (e) => {
            emit('update:materialsShow', false);
        });
    }
});

</script>

<template>
<div>
    <div class="d-flex flex-column gap-2 mb-2">
        <div class="p-2 pb-0 d-flex flex-column ba-panel align-items-start">
            <template v-for="(skillItem, i) in skillItems">
                <div v-if="i > 0" class="ba-panel-separator mb-2"></div>
                <SkillPanelItem v-bind="skillItem"></SkillPanelItem>
            </template>

        </div>
        <div class="d-flex flex-row align-items-center gap-2">
            <button v-if="props.materials" class="btn-pill" ref="collapseButton">
                <span class="label">
                    {{ translateUi('student_skills_materials') }}
                    <fa icon="angle-down" class="ms-2 animate-transform" :class="{'fa-rotate-180': materialsShow}" />
                </span>
            </button>
            <input type="range" class="form-range flex-fill" @input="emit('update:skillLevel', $event.target.valueAsNumber)" :value="skillLevel" min="1" :max="maxLevel">
            <span class="ba-slider-label">
                <img v-if="skillLevel == maxLevel" :src="'/images/ui/ImageFont_Max.png'">
                <template v-if="skillLevel != maxLevel">{{ `Lv.${skillLevel}` }}</template>
            </span>
        </div>
    </div>
    <div v-if="props.materials" ref="collapseTarget" class="collapse w-100" :class="{show: initialShow}">
        <div class="ba-panel p-2 mb-2">
            <div class="d-flex align-items-center flex-wrap">
                <button class="btn-pill me-2" :class="{deactivated: !showCumulative}" @click="$emit('update:showCumulative', !showCumulative)">
                    <span class="label">
                        <fa icon="square" class="off" />
                        <fa icon="square-check" class="on" />
                        <span class="ps-2">{{ translateUi('show_cumulative') }}</span>
                    </span>
                </button>
                <!-- <template v-if="skillLevel > 1">
                    <b v-if="showCumulative">Lv. 1 → Lv. {{ skillLevel }}</b>
                    <b v-else>Lv. {{ skillLevel - 1 }} → Lv. {{ skillLevel }}</b>
                </template> -->
                <div class="ba-info-pill bg-theme ms-auto">
                    <img src="/images/item/icon/currency_icon_gold.webp" style="height:26px;width:auto;">
                    <span class="label text-bold ps-1">&times;{{ credits.toLocaleString() }}</span>
                </div>
            </div>
            <div class="item-icon-list p-2 pb-0 my-1">
                <p v-if="materials.length == 0">{{ translateUi('student_skills_materials_none') }}</p>
                <template v-if="materials.length">
                    <ItemIcon v-for="material in materials" :item-type="material.type" :item-id="material.id" :primary-label="'&times;' + abbreviateNumber(material.amount)" />
                </template>
            </div>
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