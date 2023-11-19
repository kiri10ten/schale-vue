<script setup>
import { breakpointsBootstrapV5, useBreakpoints } from '@vueuse/core';
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import EventList from '../components/event/EventList.vue';
import { getEventById } from '../composables/Events';
import { translate, translateUi } from '../composables/Localization';
import { setBackground, setPageTitle } from '../composables/Utilities';
import { useSettingsStore } from '../stores/SettingsStore';
import EventRender from '../components/event/EventRender.vue';

const route = useRoute();

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('md');
const hideList = breakpoints.smaller('lg');
const useThreeCol = inject('useThreeCol');

const settings = useSettingsStore().settings;

const renderEvent = computed(() => {
    if (route.params.eventid) {
        const event = getEventById(route.params.eventid);
        setPageTitle(translate('EventName', event.Id) ?? translateUi('events'));
        return event;
    } else {
        setPageTitle(translateUi('events'));
        return null
    }

});

setBackground('/images/background/BG_HQ.jpg');

</script>

<template>

<div class="py-lg-3" :class="{'g-0': hideList && renderEvent, 'container-fluid' : useThreeCol, 'container-xl': !useThreeCol}">
    <div class="d-flex h-100">
        <div v-if="!hideList || !renderEvent" class="ba-page left-column">
            <EventList :selected="renderEvent" :sidebar-mode="!hideList" />
        </div>
        <div v-if="renderEvent" class="right-column h-100" :class="{'ba-page': !hideList}">

            <div v-if="hideList" class="navigation-buttons d-flex p-2">
                <RouterLink tag="button" class="btn-pill" :to="`/event`">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="ms-2"/>
                    <span class="label">{{ translateUi('events') }}</span>
                </RouterLink>
            </div>

            <EventRender :event="renderEvent" />

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

    @include lg-up {
        min-width: 480px;
        width: 480px;
        padding-right: 0.5rem;
    }

    @include xxl-up {
        min-width: 640px;
        width: 640px;
    }
}

.right-column {
    width: 100%;

    @include lg-up {
        padding-left: 0.5rem;
        width: calc(100% - 480px);
        max-width: calc(100% - 480px);
    }

    @include xxl-up {
        width: calc(100% - 640px);
        max-width: calc(100% - 640px);
    }
}

</style>