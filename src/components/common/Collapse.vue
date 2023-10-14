<script setup>
import { Collapse } from 'bootstrap';
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['update:show']);

const bsCollapse = ref(null);

const collapse = ref(null);

function _show() {
    bsCollapse.value.show();
}

function _hide() {
    bsCollapse.value.hide();
}

function _toggle() {
    bsCollapse.value.toggle();
}

onMounted(() => {
    bsCollapse.value = new Collapse(collapse.value, { toggle: false });

    bsCollapse.value.addEventListener('show.bs.collapse', (e) => {
        emit('update:show', true);
    });
    bsCollapse.value.addEventListener('hide.bs.collapse', (e) => {
        emit('update:show', false);
    });

});

onUnmounted(() => {
    bsCollapse.value.dispose();
})

defineExpose({
    show: _show,
    hide: _hide,
    toggle: _toggle
})

</script>

<template>
    <div ref="collapse" class="collapse">
        <slot></slot>
    </div>
</template>