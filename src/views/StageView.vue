<script setup>
import { breakpointsBootstrapV5, useBreakpoints, useMediaQuery } from '@vueuse/core';
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import { translateUi } from '../composables/Localization';
import { getStageById } from '../composables/Stages';
import { setBackground, setPageTitle } from '../composables/Utilities';
import { useSettingsStore } from '../stores/SettingsStore';
import StageList from '../components/stage/StageList.vue';
import StageRender from '../components/stage/StageRender.vue';

const route = useRoute();

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');
const hideList = breakpoints.smaller('lg');
const useThreeCol = inject('useThreeCol');

const settings = useSettingsStore().settings;

const renderStage = computed(() => {
    if (route.params.stageid) {
        const stage = getStageById(route.params.stageid);
        setPageTitle(stage.Title ?? stage.Name ?? translateUi('stages'));
        return stage;
    } else {
        setPageTitle(translateUi('stages'));
        return null
    }

});

setBackground('/images/background/BG_HQ.jpg');

</script>

<template>

<div class="py-lg-3" :class="{'g-0': hideList && renderStage, 'container-fluid' : useThreeCol, 'container-xl': !useThreeCol}">
    <div class="d-flex h-100 gap-3">
        <div v-if="!hideList || !renderStage" class="ba-page left-column">
            <StageList :selected="renderStage" :sidebar-mode="!hideList" />
        </div>
        <div v-if="renderStage" class="flex-fill h-100 overflow-hidden" :class="{'ba-page': !hideList}">

            <div v-if="hideList" class="navigation-buttons d-flex p-2">
                <RouterLink tag="button" class="btn-pill" :to="`/stage`">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="ms-2"/>
                    <span class="label">{{ translateUi('stages') }}</span>
                </RouterLink>
            </div>

            <StageRender :stage="renderStage" class="card" />
        </div>
    </div>
</div>

</template>

<style scoped lang="scss">

@import '../styles/_mixins.scss';

.navigation-buttons {

    button, a {

        height: 36px;
        padding-left: 0.5rem;
        padding-right: 0.5rem;

        @include backdrop-filter(var(--var-glass-filter-navbar));

        background-color: var(--col-theme-glass);

        &:focus {
            background-color: var(--col-btn-secondary);
        }
    
        &:hover {
            background-color: var(--col-btn-secondary);
        }
    
        &.active {
            background-color: var(--col-btn-active-secondary);
        }    
    }
}

.left-column {

    width: 100%;

    @include md-up {
        min-width: 480px;
        width: auto;
    }

    @include xxl-up {
        min-width: 640px;
        width: auto;
    }
}

</style>