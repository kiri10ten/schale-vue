<script setup>
import { computed } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { studentsGenerator } from '../../composables/Student';
import { useSettingsStore } from '../../stores/SettingsStore';
import StudentIcon from '../student/StudentIcon.vue';
import Modal from '../common/Modal.vue';
import FurnitureTemplateCatalog from './FurnitureTemplateCatalog.vue';

const settings = useSettingsStore().settings;

const interactionTypeDescription = {
    0: '<b>REQ</b>: Only interacts if all other required students (if any) are present.',
    1: '<b>ALL</b>: Always interacts if present, regardless of other students.',
    2: '<b>ADD</b>: Only interacts if required students are present.',
    3: '<b>SOLO</b>: If multiple eligible students are present only one will interact.',
}

const props = defineProps({
    furniture: {
        type: Object,
        required: true
    }

});

const interactionList = computed(() => {
    const interactionList = {
        0: [],
        1: [],
        2: [],
        3: []
    };
    let display = false;

    for (const student of studentsGenerator()) {

        if (!student.IsReleased[settings.server]) {
            continue;
        }

        for (let i = 0; i < student.FurnitureInteraction[settings.server].length; i++) {

            if (props.furniture.Id == student.FurnitureInteraction[settings.server][i][0]) {

                interactionList[student.FurnitureInteraction[settings.server][i][1]].push({
                    id: student.Id,
                    name: student.Name,
                    path: student.PathName,
                    description: interactionTypeDescription[student.FurnitureInteraction[settings.server][i][1]],
                });

                display = true;
            }

        }            
        
    }

    return {list: interactionList, display};
});

const templateList = computed(() => {

    const templateList = [];

    if (props.furniture.Templates) {

        for (const template of props.furniture.Templates) {

            if (template[0] > regionSettings.value.FurnitureTemplateMax) {
                continue;
            } else {

                templateList.push({
                    id: template[0],
                    amount: template[1],
                    name: translate('FurnitureTemplate', template[0])
                });
            }

        }
    }

    return templateList;
})

</script>

<template>
    <div class="d-flex flex-row gap-2 align-items-start flex-wrap">
        <div class="ba-panel p-2 d-flex flex-column flex-fill gap-2" v-if="interactionList.display">
            <i>
                <img class="inline-img" :src="'/images/ui/Cafe_Icon_Interaction.png'">
                {{ translateUi('furniture_interaction_list') }}
            </i>
            <div class="d-flex align-items-center justify-content-center flex-wrap">

                <StudentIcon v-for="student in interactionList.list[0]" :key="student.id" v-bind="student" :label="'REQ'"></StudentIcon>
                <StudentIcon v-for="student in interactionList.list[1]" :key="student.id" v-bind="student" :label="'ALL'"></StudentIcon>
                <StudentIcon v-for="student in interactionList.list[2]" :key="student.id" v-bind="student" :label="'ADD'"></StudentIcon>
                <StudentIcon v-for="student in interactionList.list[3]" :key="student.id" v-bind="student" :label="'SOLO'"></StudentIcon>

            </div>
        </div>
        <div class="ba-panel p-2 d-flex flex-column flex-fill gap-2" v-if="templateList.length">
            <i>
                {{ translateUi('furniture_templates') }}
            </i>
            <div class="selection-grid stage selection-grid-flex mb-1">
                <Modal v-for="template in templateList" :key="template.id" :title="`Preset Layout: ${template.name}`" class="selection-grid-card card-shop">
                    <template #trigger>

                        <div class="card-img"><img :src="`/images/furniture/template/${template.id}.webp`"></div>
                        <span class="card-badge stage-droprate">&times;{{ template.amount }}</span>
                        <div class="card-label">
                            <span class="label-text smalltext">{{ template.name }}</span>
                        </div>

                    </template>
                    <template #body>
                        <FurnitureTemplateCatalog :templateId="template.id"></FurnitureTemplateCatalog>
                    </template>
                </Modal>
            </div>
        </div>
    </div>
</template>