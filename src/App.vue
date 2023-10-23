<script setup>
import { Tooltip } from "bootstrap";
import { onUpdated, provide, ref } from 'vue';
import { RouterView } from 'vue-router';
import NavbarHeader from './components/navbar/NavbarHeader.vue';
import { setHighContrast, setNoBackground, setTheme } from './composables/Utilities';
import { useSettingsStore } from './stores/SettingsStore';
import { bindTooltips } from "./composables/Tooltips";
import { promiseTimeout } from "@vueuse/core";
import { useDataStore } from "./stores/DataStore";

const settings = useSettingsStore().settings;
const jsonDataLoaded = ref(false);

const background = ref('');
provide('background', background);

setTheme();
setHighContrast();
setNoBackground();

document.body.classList.add(`font-${settings.language}`);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);

onUpdated(bindTooltips);

const jsonDataStore = useDataStore();

jsonDataStore.ensureData('localization').then(() => {
    jsonDataLoaded.value = true;
})

</script>

<template>

  <div v-if="jsonDataLoaded">
        <div id="ba-background" :style="{ position: 'fixed'}"></div>

        <div id="ba-content" class="container-fluid p-0">

            <header>
                <NavbarHeader />
            </header>

            <main>
                <RouterView />
            </main>

        </div>
  </div>

</template>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Sans+Thai:wght@400;500;700&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400;1,700&display=swap');
</style>