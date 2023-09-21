<script setup>
import { translateUi } from '../../composables/Localization'
import NavbarSettings from './NavbarSettings.vue'
</script>

<template>

<nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-dark drop-shadow" style="min-height: 56px;">
    <div class="container-fluid">
        <img id="navbar-logo" :src="'/images/schale.png'" class="invert-light" style="height:38px; width:auto">
        <a class="navbar-brand me-4 unselectable" onclick="window.scrollTo(0,0);" translate="no">
            SCHALE<span class="navbar-accent">.gg Vue</span>
        </a>
        <div class="dropdown ms-auto order-lg-1">
            <a class="btn btn-dark" href="#" id="ba-navbar-settings" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" >
                <font-awesome-icon :icon="['fas', 'gear']" />
            </a>
            <div id="settings-dropdown-menu" class="dropdown-menu dropdown-menu-end dropdown-menu-dark p-3">
                <NavbarSettings></NavbarSettings>
            </div>
        </div>
        <button class="btn btn-dark d-lg-none ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#ba-navbar-content"><fa icon="bars" /></button>
        <div class="collapse navbar-collapse" id="ba-navbar-content">
            <ul class="navbar-nav my-2 my-lg-0 order-2 order-lg-1">
                <RouterLink to="/" class="nav-link">{{ translateUi('navbar_home') }}</RouterLink>
                <RouterLink to="/student" class="nav-link">{{ translateUi('navbar_students') }}</RouterLink>
            </ul>
            <!-- <ul class="navbar-nav flex-fill me-lg-2 order-1 order-lg-2 mt-3 mt-lg-0">
                <div class="position-relative" style="width: 100%;height:38px;display: flex;justify-content: end;">
                    <div id="navbar-search" class="position-absolute">
                        <input type="search" class="form-control" style="height: 38px; padding-right: 30px;" id="ba-navbar-search" :placeholder="translateUi('search')" autocomplete="off">
                        <fa id="navbar-search-icon" icon="search"></fa>
                        <i id="navbar-search-clear" class="search-clear fa-solid fa-close" data-target="ba-navbar-search" style="display:none;"></i>
                        <span class="shortcut-hint">/</span>
                    </div>
                    <div id="navbar-search-results" style="display: none;">
                    </div>
                </div>
            </ul> -->
        </div>
    </div>
</nav>

</template>