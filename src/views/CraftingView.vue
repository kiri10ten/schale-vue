<script setup>
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import CraftingList from '../components/crafting/CraftingList.vue';
import { getCraftNodeById } from '../composables/Crafting';
import { translateUi } from '../composables/Localization';
import { setBackground, setPageTitle } from '../composables/Utilities';
import { useSettingsStore } from '../stores/SettingsStore';
import CraftNodeRender from '../components/crafting/CraftNodeRender.vue';

const route = useRoute();

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');
const hideList = breakpoints.smaller('lg');
const useThreeCol = inject('useThreeCol');

const settings = useSettingsStore().settings;

const renderCraft = computed(() => {
    if (route.params.nodeid) {
        const craftnode = getCraftNodeById(route.params.nodeid);
        setPageTitle(craftnode[`Name${useSettingsStore().languageProp}`] ?? craftnode.NameJp ?? translateUi('crafting'));
        return craftnode;
    } else {
        setPageTitle(translateUi('crafting'));
        return null
    }

});

setBackground('/images/background/BG_CraftChamber_Night.jpg');

</script>

<template>

<div class="py-lg-3" :class="{'g-0': hideList && renderCraft, 'container-fluid' : useThreeCol, 'container-xl': !useThreeCol}">
    <div class="d-flex h-100 gap-3">
        <div v-if="!hideList || !renderCraft" class="ba-page left-column">
            <CraftingList :selected="renderCraft" :sidebar-mode="!hideList" />
        </div>
        <div v-if="renderCraft" class="flex-fill h-100 overflow-hidden" :class="{'ba-page': !hideList}">

            <div v-if="hideList" class="navigation-buttons d-flex p-2">
                <RouterLink tag="button" class="btn-pill" :to="`/crafting`">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="ms-2"/>
                    <span class="label">{{ translateUi('crafting') }}</span>
                </RouterLink>
            </div>

            <CraftNodeRender :craft-node="renderCraft" />
            
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
        min-width: 840px;
        width: auto;
    }
}

</style>