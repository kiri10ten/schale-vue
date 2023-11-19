<script setup>
import { useVModel } from '@vueuse/core';
import { Dropdown } from 'bootstrap';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
    items: Array,
    selectedIndex: Number,
    options: {
        type: Object,
        default() {
            return {
                autoClose: true,
            }
        }
    }
});

const emit = defineEmits(['update:selectedIndex']);
const selectedIndex = useVModel(props, 'selectedIndex', emit);

const trigger = ref(null);
const bsDropdown = ref(null);

function _show() {
    bsDropdown.value.show();
}

function _hide() {
    bsDropdown.value.hide();
}

function _toggle() {
    bsDropdown.value.toggle();
}

onMounted(() => {
    bsDropdown.value = new Dropdown(trigger.value, props.options);

    // trigger.value.addEventListener('show.bs.dropdown', (e) => {
    //     e.stopPropagation();
    //     emit('update:show', true);
    // });
    // trigger.value.addEventListener('hide.bs.dropdown', (e) => {
    //     e.stopPropagation();
    //     emit('update:show', false);
    // });

});

onUnmounted(() => {
    bsDropdown.value.dispose();
})

defineExpose({
    show: _show,
    hide: _hide,
    toggle: _toggle
})

</script>

<template>
    <div class="dropdown">
        <button class="btn-pill" data-bs-toggle="dropdown" ref="trigger">
            <slot name="button" :item="items[selectedIndex]">
                <span class="label">{{ items[selectedIndex] }}</span>
            </slot>
            <fa icon="caret-down" class="me-2" />
        </button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-scroll-large" style="max-height: calc(100vh - 150px);">
            <li v-for="(item, index) in items">
                <button class="dropdown-item w-100 d-flex align-items-center" :class="{active: selectedIndex == index}" @click="selectedIndex = index">
                    <slot name="listItem" :item="item">
                        <span>{{ item }}</span>
                    </slot>
                </button>
            </li>
        </ul>
    </div>

</template>