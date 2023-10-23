<script setup>
import { toRef, computed } from 'vue';
import { genericGiftTags, useStudentsByGift } from '../../composables/StudentGifts';
import StudentIcon from '../student/StudentIcon.vue';

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    ownedOnly: Boolean
});

const gifts = useStudentsByGift(toRef(props, 'item'), toRef(props, 'ownedOnly'));

const baseFavorGrade = computed(() => 1 + props.item.Tags.filter(x => genericGiftTags.includes(x)).length);

</script>

<template>
    <div class="ba-panel p-2 d-flex flex-column gap-2">
        <template v-for="grade in [4,3,2,1]">
            <template v-if="gifts[grade].length">
                <div class="text-italic">
                    <img class="me-1 inline-img" :src="`/images/ui/Cafe_Interaction_Gift_0${grade}.png`">
                    {{ item.ExpValue * grade }} EXP when given to
                </div>

                <div class="d-flex align-items-center justify-content-center flex-wrap">
                    <StudentIcon v-for="student in gifts[grade]" :key="student.id" v-bind="student"></StudentIcon>
                </div>

            </template>
        </template>
        <div class="text-italic">
            <img class="me-1 inline-img" :src="`/images/ui/Cafe_Interaction_Gift_0${baseFavorGrade}.png`">
            {{ item.ExpValue * baseFavorGrade }} EXP when given to all other students
        </div>
    </div>
</template>