<script setup>
import StudentList from '../components/student/StudentList.vue';
import { setBackground } from '../composables/Utilities';

setBackground('BG_MainOffice_Night.jpg');
document.title = `Students | Schale`

</script>

<template>
    <div class="container-fluid mt-3">
        <StudentList></StudentList>
    </div>
    
</template>