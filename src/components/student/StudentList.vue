<script setup>
import { computed } from 'vue';
import { studentMap, studentsGenerator } from '../../composables/Student';
import { useSettingsStore } from '../../stores/SettingsStore';
import StudentListItem from './StudentListItem.vue';

const settings = useSettingsStore().settings;

const studentList = computed(() => {

    const studentList = [];

    for (const student of studentsGenerator()) {
        if (student.IsReleased[settings.server]) {
            studentList.push(student);
        }
    }

    return studentList.sort((a, b) => a.DefaultOrder - b.DefaultOrder);

}) 

</script>

<template>

<div class="card p-2 my-2">
    <div id="ba-student-search-results" class="flex-fill p-3" style="overflow-y: auto;">
        <div id="student-select-grid" class="selection-grid student align-top flex-fill">
            <StudentListItem v-for="student in studentList" :student="student"></StudentListItem>
        </div>
    </div>
</div>

</template>