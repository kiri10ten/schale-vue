<script setup>
import { breakpointsBootstrapV5, useBreakpoints, useMediaQuery } from '@vueuse/core';
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import { translate, translateUi } from '../composables/Localization';
import { getRaidPathName, getTimeAttackById, getWorldRaidById, getWorldRaidPathName } from '../composables/Raids';
import { setBackground, setPageTitle } from '../composables/Utilities';
import RaidList from '../components/raid/RaidList.vue';
import RaidRender from '../components/raid/RaidRender.vue';

const route = useRoute();

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');
const hideList = breakpoints.smaller('lg');
const useThreeCol = inject('useThreeCol');

const renderRaid = computed(() => {
    let raid;
    switch (route.name) {
        case 'raidview':
            if (route.params.raidid) {
                raid = getRaidPathName(route.params.raidid);
                setPageTitle(raid.Name ?? translateUi('raids'));
                return { raid: raid, type: 'Raid' };
            } else {
                return { raid: null, type: 'Raid' };
            }

        case 'timeattackview':
            if (route.params.raidid) {
                raid = getTimeAttackById(route.params.raidid);
                setPageTitle(`#${raid.Id} ${translate('TimeAttackStage', raid.DungeonType)}` ?? translateUi('raids'));
                return { raid: raid, type: 'TimeAttack' };
            } else {
                return { raid: null, type: 'TimeAttack' };
            }

        case 'worldraidview':
            if (route.params.raidid) {
                raid = getWorldRaidPathName(route.params.raidid);
                setPageTitle(raid.Name ?? translateUi('raids'));
                return { raid: raid, type: 'WorldRaid' };
            } else {
                return { raid: null, type: 'WorldRaid' };
            }
    }
});

setBackground('/images/background/BG_Raid.jpg');

</script>

<template>

<div class="py-lg-3 page" :class="{'g-0': hideList && renderRaid.raid, 'container-fluid three-col' : useThreeCol, 'container-xl': !useThreeCol}">
    <div class="d-flex h-100 gap-3">
        <div v-if="!hideList || !renderRaid.raid" class="ba-page left-column">
            <RaidList :selected="renderRaid" :sidebar-mode="!hideList"></RaidList>
        </div>
        <div v-if="renderRaid.raid" class="flex-fill h-100" :class="{'ba-page': !hideList}">

            <div v-if="hideList" class="navigation-buttons d-flex p-2">
                <RouterLink tag="button" class="btn-pill" :to="`/${renderRaid.type.toLowerCase()}`">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="ms-2"/>
                    <span class="label">{{ translateUi('raids') }}</span>
                </RouterLink>
            </div>

            <RaidRender v-bind="renderRaid"></RaidRender>

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

.page {

    width: 100%;

    &.three-col {
        height: calc(100vh - 56px);
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