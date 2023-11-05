<script setup>
import { Modal } from 'bootstrap';
import { onMounted, onUnmounted, onUpdated, ref } from 'vue';

const props = defineProps({
    fixedHeight: Boolean,
    keepAlive: Boolean,
    noBackdrop: Boolean,
});

const bsModal = ref(null);

const modal = ref(null);
const modalOpen = ref(false);

function _show() {
    bsModal.value.show();
}

function _hide() {
    bsModal.value.hide();
}

onMounted(() => {
    bsModal.value = new Modal(modal.value, {backdrop: !props.noBackdrop});
    
    modal.value.addEventListener('show.bs.modal', (e) => {
        modalOpen.value = true;
    });

    modal.value.addEventListener('hidden.bs.modal', (e) => {
        modalOpen.value = false;
    });
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

    <a @click="_show" v-bind="$attrs">
        <slot name="trigger"></slot>
    </a>
   
    <Teleport to="body">
        <div class="modal fade" ref="modal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-fullscreen-lg-down">
                <div v-if="modalOpen || keepAlive" class="modal-content" :class="{'h-100': fixedHeight}">
                    <div class="modal-header" style="border-bottom: none;">
                        <h5 class="modal-title">
                            <slot name="title"></slot>
                        </h5>
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

<style scoped>

a:hover {
    cursor: pointer;
}

</style>