<script setup>
import StudentList from '../components/student/StudentList.vue';
import { translateUi } from '../composables/Localization';
import { setBackground } from '../composables/Utilities';

setBackground('BG_MainOffice_Night.jpg');
document.title = `${translateUi('navbar_students')} | Schale`;

</script>

<template>
    <div class="container-fluid mt-3">
        <StudentList></StudentList>
    </div>
    
</template>