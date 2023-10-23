<script setup>
import CurrentEvents from '../components/home/CurrentEvents.vue';
import { translateUi } from '../composables/Localization';
import { setBackground } from '../composables/Utilities';

document.title = `${translateUi('navbar_home')} | Schale`
setBackground('BG_ReceptionRoom.jpg');

</script>

<template>

    <div class="container-fluid py-3">
        <div id="ba-home" class="d-flex w-100 gap-3">
            <div id="ba-home-info" class="card p-2 flex-fill">
                <div class="card-body">
                    <div class="d-flex align-items-end p-2">
                        <img :src="'/images/ui/Arona_Construction.png'" height="120">
                        <h1>{{ translateUi('home_welcome') }}</h1>
                    </div>
                    <div>
                        <p>Welcome! This is a preview of the next version of Schale.gg. It's an entirely new site which is being rebuilt using Vue.js.</p>
                        <p>Please note that this is currently in early development, and is not intended for general use yet. A lot of changes you see at this stage are very likely to not be final. Aiming to be feature complete by the end of 2023, and planned for release some time in 2024.</p>
                        <h4>Planned features:</h4>
                        <ul>
                            <li>Reworked layout across most modules that will display as full-width on larger displays.</li>
                            <li>Improved UI on smaller screens.</li>
                            <li>Separate student collections per game server.</li>
                            <li>Improvements to the compare feature.</li>
                            <li>Damage calculation interface will be overhauled to make it cleaner and easier to use.</li>
                            <li>Support for Tactical Challenge (PvP) in damage calculation.</li>
                            <li>Improvements to site-wide search.</li>
                            <li>Redesign of stage maps.</li>
                            <li>Schedule/Lesson module with drop information.</li>
                            <li>Events module with shop and mission information.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="ba-home-events card p-3">
                <CurrentEvents />
            </div>
        </div>
    </div>

</template>

<style scoped lang="scss">
@import '../styles/_mixins.scss';

#ba-home {
    @include lg-down {
        flex-direction: column;
    }
}

.ba-home-events {

    min-width: 500px;

    @include lg-down {
        width: 100%;
    }
}

</style>
