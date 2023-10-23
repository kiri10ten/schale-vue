<script setup>
import { computed } from 'vue';
import { translateUi } from '../../composables/Localization';
import Tooltip from '../common/Tooltip.vue';


const props = defineProps({
    id: Number,
    name: String,
    path: String,
    description: String,
    label: String
});


const tooltip = computed(() => {
    return {
        title: props.name,
        subtitle: translateUi('student'),
        //rarity: renderItem.value.Rarity,
        icon: `/images/student/icon/${props.id}.webp`,
        body: props.description,
        iconClass: 'circle'
    }
});

</script>

<template>

    <RouterLink :to="{name: 'studentview', params: {studentid: path }}">
        <Tooltip v-bind="tooltip" class="ba-item-student position-relative">
            <img :src="`/images/student/icon/${id}.webp`" :alt="name">
            <span v-if="label" class="bonus-label" v-html="label"></span>
        </Tooltip>
    </RouterLink>

</template>