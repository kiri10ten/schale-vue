<script setup>
import { computed } from 'vue';
import { regionSettings } from '../../composables/RegionSettings';

const props = defineProps({
    skill: Object,
    type: String,
    bulletType: String,
    skillLevel: Number
});

const maxLevel = computed(() => {
    return props.type == 'Ex' ? 5 : 10
})

const emit = defineEmits(['update:skillLevel']);

function changeLevel(level) {

    const newLevel = Math.min(Math.max(parseInt(level), 0), maxLevel.value);

    if (!isNaN(newLevel)) {
        emit('update:skillLevel', newLevel);
    }

}

</script>

<template>
    <div class="input-small">
        <div class="icon statpreview-passive bg-skill" :class="bulletType.toLowerCase()">
            <img :src="`/images/skill/${skill.Icon}.webp`" width="28" height="28">
        </div>
        <span class="label">Lv.</span>
        <input class="form-control support-bond" type="number" pattern="\d*" :value="skillLevel" min="0" :max="maxLevel" @click="$event.target.select()" @change="changeLevel($event.target.value)">
    </div>
</template>

<style scoped lang="scss">
    .icon {
        border-radius: 999px;

        img {
            background: none;
        }
    }

    .label {
        pointer-events: none;
        left: 32px;
    }

    input {

        width: 90px;
        padding-left: 58px
    }
</style>