<script setup>
import { regionSettings } from '../../composables/RegionSettings';

const props = defineProps({
    studentId: Number,
    bondLevel: Number
});

const emit = defineEmits(['update:bondLevel']);

function changeBond(level) {

    const newLevel = Math.min(Math.max(parseInt(level), 1), regionSettings.value.BondMaxLevel);
    
    if (!isNaN(newLevel)) {
        emit('update:bondLevel', newLevel);
    }

}

</script>

<template>
    <div class="input-small">
        <div class="icon bond-small">
            <img :src="`/images/student/icon/${studentId}.webp`">
        </div>
        <input class="form-control support-bond" type="number" pattern="\d*" :value="bondLevel" min="1" :max="regionSettings.BondMaxLevel" @click="$event.target.select()" @change="changeBond($event.target.value)">
    </div>
</template>