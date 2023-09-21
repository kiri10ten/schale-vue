<script setup>
import { Tooltip } from "bootstrap";
import { onUpdated, provide, ref } from 'vue';
import { RouterView } from 'vue-router';
import NavbarHeader from './components/navbar/NavbarHeader.vue';
import { setTheme } from './composables/Utilities';
import { useLocalizationDataStore } from './stores/LocalizationDataStore';
import { useSettingsStore } from './stores/SettingsStore';
import { bindTooltips } from "./composables/Tooltips";

const settings = useSettingsStore().settings;
const jsonDataLoaded = ref(false);

const background = ref('');
provide('background', background);

setTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);

onUpdated(bindTooltips);

console.log('start fetch')
const localizationDataStore = useLocalizationDataStore();
localizationDataStore.fetchData().then(() => {
    jsonDataLoaded.value = true;
})

</script>

<template>

  <div v-if="jsonDataLoaded" :class="{'high-contrast': settings.highcontrast}">
        <div id="ba-background" :style="{ position: 'fixed'}"></div>

        <div id="ba-content" class="container-fluid p-0">

            <header>
                <NavbarHeader />
            </header>

            <main id="loaded-module">
                <RouterView />
            </main>

        </div>
  </div>

</template>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Sans+Thai:wght@400;500;700&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400;1,700&display=swap');
</style>