<script setup>
import { computed, ref, watch } from 'vue';
import EnemyCard from './EnemyCard.vue';
import EnemyDetails from './EnemyDetails.vue';

const props = defineProps({
    enemies: {
        type: Array,
        required: true
    }
})

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

<div class="d-flex gap-2 flex-column">
    <div class="ba-panel p-2">
        <div class="selection-grid enemy selection-grid-flex hover enemy-list p-2">
            <EnemyCard v-for="(enemy, index) in enemies" :key="enemy.enemy.Id" :class="{selected: selectedIndex == index}" v-bind="enemy" @click="selectedIndex = index" />
        </div>
    </div>
    <EnemyDetails v-bind="selectedEnemy" />
</div>



</template>