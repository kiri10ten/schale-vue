<script setup>
import { computed, ref, watch } from 'vue';
import EnemyCard from './EnemyCard.vue';
import EnemyDetails from './EnemyDetails.vue';
import { translateUi } from '../../composables/Localization';

const props = defineProps({
    enemies: {
        type: Array,
        required: true
    },
    unitFilter: Boolean,
    horizontalMode: Boolean,
})

const emit = defineEmits(['clearUnitFilter']);

const selectedIndex = ref(0);

const selectedEnemy = computed(() => {
    return props.enemies[selectedIndex.value];
})

watch(() => props.enemies, () => {
    if (selectedIndex.value >= props.enemies.length) {
        selectedIndex.value = 0;
    }
})

</script>

<template>

<div class="d-flex" :class="horizontalMode ? 'flex-row align-items-start gap-3' : 'flex-column gap-2'">
    <div :style="{width: horizontalMode ? '50%' : 'auto'}">
        <div class="ba-panel p-2">
            <div class="selection-grid enemy selection-grid-flex hover enemy-list p-2">
                <EnemyCard v-for="(enemy, index) in enemies" :key="`${enemy.enemy.Id}_${enemy.level}_${enemy.grade}`" :class="{selected: selectedIndex == index}" v-bind="enemy" @click="selectedIndex = index" />
            </div>
        </div>
        <button v-if="unitFilter" class="btn-pill mt-2" @click="emit('clearUnitFilter')">
            <span class="label">
                <fa icon="filter-circle-xmark" class="me-2"/>{{ translateUi('unit_clear_map_filter') }}
            </span>
        </button>      
    </div>

    <div :style="{width: horizontalMode ? '50%' : 'auto'}">
        <EnemyDetails v-bind="selectedEnemy" />
    </div>
    
</div>

</template>