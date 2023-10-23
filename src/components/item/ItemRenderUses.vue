<script setup>
import { ref, computed } from 'vue';
import { studentsGenerator } from '../../composables/Student';
import { useSettingsStore } from '../../stores/SettingsStore';
import StudentIcon from '../student/StudentIcon.vue';
import { translateUi } from '../../composables/Localization';
import { useStudentStore } from '../../stores/StudentStore';
import ItemRenderUseGift from './ItemRenderUseGift.vue';

const settings = useSettingsStore().settings;
const ownedStudents = ref(false);

const props = defineProps({
    item: {
        type: Object,
        required: true
    }

});

const studentsUseList = computed(() => {
    const studentUseSkillList = [];
    const studentUseGearList = [];

    if (props.item.Category == 'Material' || props.item.Category == 'Favor') {
        for (const student of studentsGenerator()) {
            if (!student.IsReleased[settings.server]) {
                continue;
            }

            if (ownedStudents.value && !useStudentStore().collectionExists(student.Id)) {
                continue;
            }

            let amount = {Ex: 0, Other: 0};
            for (let i = 0; i < student.SkillExMaterial.length; i++) {
                for (let j = 0; j < student.SkillExMaterial[i].length; j++) {
                    if (props.item.Id == student.SkillExMaterial[i][j]) {
                        amount.Ex += student.SkillExMaterialAmount[i][j]
                    }
                }
            }

            for (let i = 0; i < student.SkillMaterial.length; i++) {
                for (let j = 0; j < student.SkillMaterial[i].length; j++) {
                    if (props.item.Id == student.SkillMaterial[i][j]) {
                        amount.Other += student.SkillMaterialAmount[i][j]
                    }
                }
            }

            if (amount.Ex > 0 || amount.Other > 0) {
                const useTotal = amount.Ex + amount.Other * 3;
                studentUseSkillList.push({
                    id: student.Id,
                    name: student.Name,
                    path: student.PathName,
                    description: translateUi('item_usedby_exskill_amount', amount.Ex) + '\n' + translateUi('item_usedby_skill_amount', amount.Other),
                    label: `&times;${useTotal}`
                })
            }

            if (student.Gear.Released?.[settings.server]) {
                for (let i = 0; i < student.Gear.TierUpMaterial.length; i++) {
                    for (let j = 0; j < student.Gear.TierUpMaterial[i].length; j++) {
                        if (props.item.Id == student.Gear.TierUpMaterial[i][j]) {
                            studentUseGearList.push({
                                id: student.Id,
                                name: student.Name,
                                path: student.PathName,
                                description: null,
                                label: `&times;${student.Gear.TierUpMaterialAmount[i][j]}`
                            })
                        }
                    }
                }
            }
            
        }
    }

    return {skill: studentUseSkillList, gear: studentUseGearList};
});

</script>

<template>
    <div class="d-flex flex-column gap-2">
        <div class="d-flex gap-2">
            <h4 class="m-0 text-bold">Uses</h4>
            <button class="btn-pill ms-auto" :class="{deactivated: !ownedStudents}" @click="ownedStudents = !ownedStudents">
                <span class="label">
                    <fa icon="eye-slash" />
                    <span class="ps-2">Hide Unowned</span>
                </span>
            </button>
        </div>
        <ItemRenderUseGift v-if="item.Category == 'Favor'" :item="item" :owned-only="ownedStudents"></ItemRenderUseGift>
        <div class="ba-panel p-2 d-flex flex-column gap-2" v-if="studentsUseList.skill.length || studentsUseList.gear.length">
            <template v-if="studentsUseList.skill.length">
                <i>{{ translateUi('item_usedby_skill') }}</i>
                <div class="d-flex align-items-center justify-content-center flex-wrap">
                    <StudentIcon v-for="student in studentsUseList.skill" :key="student.id" v-bind="student"></StudentIcon>
                </div>
            </template>
            <template v-if="studentsUseList.gear.length">
                <i>{{ translateUi('item_usedby_gear') }}</i>
                <div class="d-flex align-items-center justify-content-center flex-wrap">
                    <StudentIcon v-for="student in studentsUseList.gear" :key="student.id" v-bind="student"></StudentIcon>
                </div>
            </template>
        </div>
    </div>
</template>