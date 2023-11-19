<script setup>
import { computed, ref } from 'vue';
import { craftNodeGenerator } from '../../composables/Crafting';
import { translate, translateUi } from '../../composables/Localization';
import { useMiscStore } from '../../stores/MiscStore';
import { useSettingsStore } from '../../stores/SettingsStore';
import CraftNodeCard from './CraftNodeCard.vue';

const props = defineProps({
    selected: Object,
    sidebarMode: Boolean
})

const settingsStore = useSettingsStore();
const state = useMiscStore().craftingState;

//const tab = ref('Campaign');
//const reverseSortOrder = ref(false);

const visibleNodes = computed(() => {

    const nodes = {};

    for (const node of craftNodeGenerator()) {

        if (!node.Released[settingsStore.settings.server]) {
            continue;
        }

        if (state.searchTerm !== "" && !(node[`Name${state.listUntranslated ? 'Jp' : settingsStore.languageProp}`] ?? node.NameJp).toLowerCase().includes(state.searchTerm.toLowerCase())) {
            continue;
        }

        if (nodes[node.Tier] === undefined) {
            nodes[node.Tier] = [];
        }

        nodes[node.Tier].push(node);
    }

    //list.sort((a, b) => (a.Id - b.Id) * (reverseSortOrder.value ? -1 : 1))

    return nodes;
});

</script>

<template>

    <div class="d-flex gap-3" :class="{'sidebar': sidebarMode}">
        <div class="flex-fill">
            <div :class="{'p-2 card screen-height': sidebarMode}">

                <div class="d-flex p-2 gap-2 align-items-stretch controls" :class="{'card-overlay p-2': !sidebarMode}">
                    <input type="search"
                        class="form-control circle px-3"
                        autocomplete="off"
                        v-model="state.searchTerm"
                        :placeholder="translateUi('search')"
                        >
                    <button class="btn-pill" :class="{active: state.listChance}" @click="state.listChance = !state.listChance">
                        <span class="label mx-2"><fa icon="info-circle"/></span>
                    </button>
                    <button v-if="settingsStore.settings.server == 0" class="btn-pill" :class="{active: state.listUntranslated}" @click="state.listUntranslated = !state.listUntranslated">
                        <span class="label mx-2">JP</span>
                    </button>
                </div>

                <div class="card-body">
                    <div class="selection-grid craft hover align-top flex-fill">
                        <template v-for="(nodes, tier) in visibleNodes">
                            <div class="w-100 ba-grid-header p-2" :class="{'card my-2': !sidebarMode}">
                                <h3 class="mb-0">{{ translate('NodeTier', tier) }}</h3>
                            </div>
                            <CraftNodeCard v-for="craftnode of nodes" :key="craftnode.Id" :craft-node="craftnode" :show-chance="state.listChance" :language="(settingsStore.settings.server == 0 && state.listUntranslated) ? 'Jp' : null" />
                        </template>
                    </div>
                    <p v-if="Object.keys(visibleNodes).length == 0" class="text-center py-2 m-0" :class="{card: !sidebarMode}">{{ translateUi('no_results') }}</p>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped lang="scss">

.controls {
    input, button {
        height: 40px;
    }

    &.card-overlay {
        input, button {
            height: 32px;
        }
    }
}

.card-overlay {
    position: sticky;
    top: 72px;
    z-index: 50;
}

</style>