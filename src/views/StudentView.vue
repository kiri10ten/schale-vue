<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StudentRender from '../components/student/StudentRender.vue';

import { getStudentById } from '../composables/Student.js';
import { setBackground } from '../composables/Utilities';
import { useStudentStore } from '../stores/StudentStore';
import { useSettingsStore } from '../stores/SettingsStore';

const route = useRoute();
const router = useRouter();

const settings = useSettingsStore().settings;

const studentStore = useStudentStore();

let studentId;

if (!route.params.studentid) {

    if (localStorage.getItem('student_last') && !isNaN(localStorage.getItem('student_last'))) {
        studentId = parseInt(localStorage.getItem('student_last'));
    } else {
        studentId = 10000;
    }

    router.push({ path: `student/${studentId}` });

} else {
    studentId = route.params.studentid;
}

let student = ref(getStudentById(studentId));

initialiseStudentPage(student.value);

watch(() => route.params.studentid,
    (to) => {
        student = getStudentById(to);
        initialiseStudentPage(student);
    }
)

function initialiseStudentPage(student) {
    setBackground(student.CollectionBG + '.jpg');
    localStorage.setItem('student_last', student.Id);

    if (studentStore.collectionExists(student.Id)) {
        studentStore.collectionLoad(student.Id, ...student.FavorAlts);
    }

    if (!student.Gear.Released?.[settings.server] && studentStore.studentDisplay.ActiveTab == 'gear') {
        studentStore.studentDisplay.ActiveTab = 'stats';
    }

    document.title = `${student.Name} | Schale`
}

</script>

<template>
    <StudentRender :student="student"></StudentRender>
</template>
