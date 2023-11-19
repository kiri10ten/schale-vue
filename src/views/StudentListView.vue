<script setup>
import StudentList from '../components/student/StudentList.vue';
import { translateUi } from '../composables/Localization';
import { setBackground, setPageTitle } from '../composables/Utilities';

setBackground('/images/background/BG_MainOffice_Night.jpg');
setPageTitle(translateUi('navbar_students'));

</script>

<template>
    <div class="container-fluid mt-3">
        <StudentList></StudentList>
    </div>
    
</template>