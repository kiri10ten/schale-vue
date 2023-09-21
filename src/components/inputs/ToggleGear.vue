<script setup>

const props = defineProps({
    student: Object,
    includeGear: Boolean
});

const emit = defineEmits(['update:includeGear']);

</script>

<template>
    <button class="btn-pill support-ex-gear" :class="{deactivated: !includeGear}" @click="emit('update:includeGear', !includeGear)">
        <div class="icon">
            <img class="ba-item-n" :src="`/images/gear/icon/${student.Id}.webp`" width="28" height="28">
        </div>
        <fa :icon="includeGear ? 'square-check' : 'square'" class="mx-2" />
    </button>
</template>