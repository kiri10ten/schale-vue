<script setup>

const props = defineProps({
    student: Object,
    gearTier: Number
});

const maxTier = 2;
const emit = defineEmits(['update:gearTier']);

</script>

<template>
    <div class="dropdown">
        <button class="btn-pill" data-bs-toggle="dropdown">
            <div class="icon">
                <img class="ba-item-n" :src="gearTier > 0 ? `/images/gear/icon/${student.Id}.webp` : '/images/gear/empty.png'" width="28" height="28">
            </div>
            <span class="label">
                {{ 'T' + gearTier }}
            </span>
            <fa icon="caret-down" class="me-2"></fa>
        </button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-start">
            <li>
                <button class="dropdown-item dropdown-item-icon" :class="{ active: gearTier == 0 }" @click="emit('update:gearTier', 0)">
                    <div class="icon"><img class="ba-item-n" :src="'/images/gear/empty.png'"></div>
                    <span>T0</span>
                </button>
            </li>
            <li v-for="n in maxTier">
                <button class="dropdown-item dropdown-item-icon" :class="{ active: gearTier == n }" @click="emit('update:gearTier', n)">
                    <div class="icon"><img class="ba-item-n" :src="`/images/gear/icon/${student.Id}.webp`"></div>
                    <span>{{ 'T' + n }}</span>
                </button>
            </li>
        </ul>
    </div>
</template>