<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StudentRender from '../components/student/StudentRender.vue';

import { getStudentById, getStudentByPathName } from '../composables/Student.js';
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

let student = ref(null);

initialiseStudentPage();

watch(() => route.params.studentid,
    (to) => {
        if (to) {
            studentId = to;
            initialiseStudentPage();
        }

    }
)

function initialiseStudentPage() {

    if (!isNaN(studentId)) {
        student.value = getStudentById(studentId);
    } else {
        student.value = getStudentByPathName(studentId);
    }

    setBackground(student.value.CollectionBG + '.jpg');
    localStorage.setItem('student_last', student.value.Id);

    if (studentStore.collectionExists(student.value.Id)) {
        studentStore.collectionLoad(student.value.Id, ...student.value.FavorAlts);
    }

    if (!student.value.Gear.Released?.[settings.server] && studentStore.studentDisplay.ActiveTab == 'gear') {
        studentStore.studentDisplay.ActiveTab = 'stats';
    }

    document.title = `${student.value.Name} | Schale`
}

</script>

<template>
    <StudentRender :student="student"></StudentRender>
</template>
