<script setup>
import { useVModel } from '@vueuse/core';

const props = defineProps({
    modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);

const state = useVModel(props, 'modelValue', emit);

</script>

<template>

<button class="btn-pill" :class="{deactivated: !state}" @click="state = !state">
    <span class="label">
        <fa icon="square" class="off" />
        <fa icon="square-check" class="on" />
        <span class="ms-2">
            <slot></slot>
        </span>
    </span>
</button>

</template>