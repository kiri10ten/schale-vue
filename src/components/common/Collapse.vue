<script setup>
import { Collapse } from 'bootstrap';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
    show: Boolean
});

const initialShow = props.show;

const collapseState = computed(() => props.show);

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

    collapse.value.addEventListener('show.bs.collapse', (e) => {
        e.stopPropagation();
        emit('update:show', true);
    });
    collapse.value.addEventListener('hide.bs.collapse', (e) => {
        e.stopPropagation();
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

watch(collapseState, (newVal, oldVal) => {
    if (oldVal != newVal) {
        newVal ? _show() : _hide();
    }
})

</script>

<template>
    <div ref="collapse" class="collapse" :class="{show: initialShow}">
        <slot></slot>
    </div>
</template>