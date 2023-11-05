<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '../../stores/SettingsStore';


const props = defineProps({
    raid: {
        type: Object,
        required: true
    },
    type: String,
    noLink: Boolean,
    terrain: String
})

const smallTextCharacters = {'en':19, 'jp':10, 'kr':11, 'tw':10, 'cn':10, 'zh':10, 'th': 20, 'vi': 20};

const settings = useSettingsStore().settings;

const backgroundPath = computed(() => {
    if (props.raid.IconBG) {
        return props.raid.IconBG;
    } else if (props.terrain) {
        if (props.raid.Terrain.length > 1 && props.terrain == props.raid.Terrain[1]) {
            return `Boss_Portrait_${props.raid.DevName}_LobbyBG_${props.terrain}`;
        } else {
            return `Boss_Portrait_${props.raid.DevName}_LobbyBG`;
        }
    } else {
        return `Boss_Portrait_${props.raid.DevName}_LobbyBG`;
    }
})

</script>

<template>
    <component :is="noLink ? 'div' : 'RouterLink'" :to="{name: `${type.toLowerCase()}view`, params: { 'raidid': raid.PathName }}" class="selection-grid-card card-raid">
        <div class="card-bg">
            <div :style="{backgroundImage: `url('/images/raid/${backgroundPath}.png')`}"></div>
        </div>
        <div class="card-img">
            <img :src="`/images/raid/Boss_Portrait_${raid.DevName}_Lobby.png`">
        </div>
        <div class="card-badge raid-info">
            <div class="icon-type" :class="`bg-def-${raid.ArmorType.toLowerCase()}`">
                <img src="/images/ui/Type_Defense.png" style="width:100%;">
            </div>
            <template v-if="raid.MaxDifficulty[settings.server] >= 5 && raid.BulletTypeInsane">
                <div class="icon-type" :class="`bg-atk-${raid.BulletTypeInsane.toLowerCase()}`">
                    <img src="/images/ui/Type_Attack.png" style="width:100%;">
                </div>
            </template>
            <template v-else>
                <div class="icon-type" :class="`bg-atk-${raid.BulletType.toLowerCase()}`">
                    <img src="/images/ui/Type_Attack.png" style="width:100%;">
                </div>
            </template>

        </div> 
        <div v-if="terrain" class="card-badge raid-terrain">
            <img class="invert-light" :src="`/images/ui/Terrain_${terrain}.png`">
        </div>
        <div class="card-label">
            <span class="label-text" :class="{smalltext: raid.Name.length > smallTextCharacters[settings.language]}">{{ raid.Name }}</span>
        </div>
    </component>


</template>

<style scoped lang="scss">

.icon-type {
    border-radius: 999px !important;

    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 3px;

    img {
        width: 14px;
        height: 14px;
    }
}

</style>