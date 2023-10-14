<script setup>
import { Modal } from 'bootstrap';
import { onMounted, onUnmounted, onUpdated, ref } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    }
});

const bsModal = ref(null);

const modal = ref(null);

function _show() {
    bsModal.value.show();
}

function _hide() {
    bsModal.value.hide();
}

onMounted(() => {
    bsModal.value = new Modal(modal.value);
})

onUnmounted(() => {
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    bsModal.value.dispose();
})

defineExpose({
    show: _show,
    hide: _hide
})

</script>

<template>
    <Teleport to="body">
        <div class="modal fade" ref="modal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-fullscreen-lg-down">
                <div class="modal-content">
                    <div class="modal-header" style="border-bottom: none;">
                        <h5 class="modal-title">{{ title }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body pt-1">
                        <slot name="body"></slot>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>