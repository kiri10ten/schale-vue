<script setup>
import { computed, toRefs } from 'vue';
import { getStatIconName } from '../../composables/Icon';

const props = defineProps({
    sortOptions: Object,
    sortOption: Object
})

const {sortOption} = toRefs(props);
const currentSortOption = computed(() => {
    return props.sortOptions.find(({key}) => key === sortOption.value.SortKey);
})

const sortOrderIcon = computed(() => {
    if (currentSortOption.value.reverseSort || currentSortOption.value.type == 'stat') {

        switch (currentSortOption.value.type) {
            case 'number':
                return sortOption.value.Mode == 1 ? 'arrow-down-9-1' : 'arrow-up-9-1';
            case 'string':
                return sortOption.value.Mode == 1 ? 'arrow-down-z-a' : 'arrow-up-z-a';
            default:
                return sortOption.value.Mode == 1 ? 'arrow-down-wide-short' : 'arrow-up-wide-short';
        }

    } else {

        switch (currentSortOption.value.type) {
            case 'number':
                return sortOption.value.Mode == 1 ? 'arrow-down-1-9' : 'arrow-up-1-9';
            case 'string':
                return sortOption.value.Mode == 1 ? 'arrow-down-a-z' : 'arrow-up-a-z';
            default:
                return sortOption.value.Mode == 1 ? 'arrow-down-short-wide' : 'arrow-up-short-wide';
        }

    }
})

</script>

<template>
    <div class="d-flex gap-2">
        <button class="btn-pill h-100" data-bs-toggle="dropdown" data-bs-auto-close="true">
            <span class="px-1 mx-2">{{ currentSortOption.label }}<fa icon="caret-down" class="ms-2" /></span>
        </button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end dropdown-menu-scroll-large" style="max-height: calc(100vh - 150px);">
            <template v-for="option in sortOptions">
                <template v-if="option.header">
                    <li><hr class="dropdown-divider"></li>
                    <li><h6 class="dropdown-header">{{ option.header }}</h6></li>
                </template>
                <li v-if="option.key === 'UseCollectionStats'">
                    <button class="dropdown-item w-100 d-flex align-items-center" :class="{active: sortOption.UseCollectionStats}" @click="sortOption.UseCollectionStats = !sortOption.UseCollectionStats">
                        {{ option.label }}
                        <fa v-show="sortOption.UseCollectionStats" icon="check" class="ms-auto" />
                    </button>
                </li>
                <li v-else>
                    <button class="dropdown-item" :class="{active: option.key === sortOption.SortKey, 'dropdown-item-icon': option.type == 'stat'}" @click="sortOption.SortKey = option.key">
                        <inline-svg v-if="option.type == 'stat'" class="stat-icon-svg" :src="`/images/staticon/svg/${getStatIconName(option.key)}.svg`"></inline-svg>
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

<style scoped lang="scss">
.stat-icon-svg {
    width: 24px;
    min-width: 24px;
    padding: 1px;
    margin: 0 0.5rem;
}
</style>