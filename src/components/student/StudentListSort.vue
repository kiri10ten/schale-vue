<script setup>
import { computed } from 'vue';
import { useStudentStore } from '../../stores/StudentStore';

const props = defineProps({
    sortOptions: Object
})

const sortOption = useStudentStore().studentListSort;
const currentSortOption = computed(() => {
    return props.sortOptions.find(({key}) => key === sortOption.SortKey);
})

const sortOrderIcon = computed(() => {
    if (currentSortOption.value.reverseSort || currentSortOption.value.type == 'stat') {

        switch (currentSortOption.value.type) {
            case 'number':
                return sortOption.Mode == 1 ? 'arrow-down-9-1' : 'arrow-up-9-1';
            case 'string':
                return sortOption.Mode == 1 ? 'arrow-down-z-a' : 'arrow-up-z-a';
            default:
                return sortOption.Mode == 1 ? 'arrow-down-wide-short' : 'arrow-up-wide-short';
        }

    } else {

        switch (currentSortOption.value.type) {
            case 'number':
                return sortOption.Mode == 1 ? 'arrow-down-1-9' : 'arrow-up-1-9';
            case 'string':
                return sortOption.Mode == 1 ? 'arrow-down-a-z' : 'arrow-up-a-z';
            default:
                return sortOption.Mode == 1 ? 'arrow-down-short-wide' : 'arrow-up-short-wide';
        }

    }
})

</script>

<template>
    <div class="d-flex gap-2">
        <button class="btn-pill h-100" data-bs-toggle="dropdown" data-bs-auto-close="true">
            <span class="px-1 mx-2">{{ currentSortOption.label }}<fa icon="caret-down" class="ms-2" /></span>
        </button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end dropdown-menu-scroll-large" style="height: calc(100vh - 150px);">
            <template v-for="option in sortOptions">
                <template v-if="option.header">
                    <li><hr class="dropdown-divider"></li>
                    <li><h6 class="dropdown-header">{{ option.header }}</h6></li>
                </template>
                <li v-if="option.key === 'UseCollectionStats'">
                    <button class="dropdown-item" @click="sortOption.UseCollectionStats = !sortOption.UseCollectionStats">
                        <fa :icon="sortOption.UseCollectionStats ? 'square-check' : 'square'" class="me-1" />
                        {{ option.label }}
                    </button>
                </li>
                <li v-else>
                    <button class="dropdown-item" :class="{active: option.key === sortOption.SortKey}" @click="sortOption.SortKey = option.key">
                        <img v-if="option.type == 'stat'" class="inline-img" :src="`/images/staticon/svg/${option.key}.svg`" />
                        {{ option.label }}
                    </button>
                </li>
            </template>
        </ul>

        <button class="btn-pill h-100" @click="sortOption.Mode = -sortOption.Mode">
            <span class="label"><fa :icon="sortOrderIcon" class="mx-1" /></span>
        </button>
    </div>

</template>

<style>
</style>