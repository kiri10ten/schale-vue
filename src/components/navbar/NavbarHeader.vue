<script setup>
import { useRoute } from 'vue-router';
import { translate, translateUi } from '../../composables/Localization'
import NavbarSettings from './NavbarSettings.vue'
import { onMounted, ref, watch } from 'vue';
import { Collapse } from 'bootstrap';
import { useSettingsStore } from '../../stores/SettingsStore';
import { breakpointsBootstrapV5, createReusableTemplate, useBreakpoints } from '@vueuse/core';

const route = useRoute();

const [DefineTemplate, ReuseTemplate] = createReusableTemplate();

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const mobileView = breakpoints.smaller('lg');

const settings = useSettingsStore().settings;

watch(route, () => {
    Collapse.getOrCreateInstance(document.getElementById('ba-navbar-content'), {toggle: false}).hide();
})

</script>

<template>

<DefineTemplate>
    <div class="collapse navbar-collapse" id="ba-navbar-content" ref="collapse">
        <ul class="navbar-nav my-2 my-lg-0">
            <!-- <RouterLink to="/" class="nav-link px-3 circle" :class="{active: route.name == 'home' }" >{{ translateUi('navbar_home') }}</RouterLink> -->
            <RouterLink to="/student" class="nav-link px-3 circle" :class="{active: route.path.startsWith('/student') }" >{{ translateUi('navbar_students') }}</RouterLink>
            <RouterLink to="/item" class="nav-link px-3 circle" :class="{active: route.path.startsWith('/item') || route.path.startsWith('/furniture') || route.path.startsWith('/equipment') }">{{ translateUi('item') }}</RouterLink>
            <RouterLink to="/raid" class="nav-link px-3 circle" :class="{active: route.path.startsWith('/raid') || route.path.startsWith('/timeattack') || route.path.startsWith('/worldraid') }">{{ translateUi('raids') }}</RouterLink>
        </ul>
    </div>
</DefineTemplate>

<nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-dark drop-shadow">
    <div class="container-fluid">
        <RouterLink to="/" class="navbar-logo ps-2 me-3 d-flex align-items-center" translate="no">
            <inline-svg class="logo" :src="`/images/logo.svg`"></inline-svg>
        </RouterLink>
        <ReuseTemplate v-if="!mobileView" />
        <span class="text-muted ms-auto">
            <fa icon="globe" class="me-1"></fa>
            {{ translate('ServerName', settings.server) }}
        </span>
        <div class="dropdown ms-3">
            <a class="btn btn-dark" href="#" id="ba-navbar-settings" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" >
                <font-awesome-icon :icon="['fas', 'gear']" />
            </a>
            <div id="settings-dropdown-menu" class="dropdown-menu dropdown-menu-end dropdown-menu-dark p-3">
                <NavbarSettings></NavbarSettings>
            </div>
        </div>
        <button class="btn btn-dark d-lg-none ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#ba-navbar-content"><fa icon="bars" /></button>
        <ReuseTemplate v-if="mobileView" />
    </div>
</nav>

</template>

<style lang="scss">

@import '../../styles/theme';

.navbar-logo {
    height: 40px;
}

.logo {

    height: 34px;
    width: auto;

    path.fill-primary {
        fill: var(--col-theme-text);
    }
    path.fill-secondary {
        fill: var(--col-theme-logo);
    }
}

</style>