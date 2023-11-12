<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '../../stores/SettingsStore';
import { translate } from '../../composables/Localization';
import { getTimeAttackRule } from '../../composables/Raids';


const props = defineProps({
    timeAttack: {
        type: Object,
        required: true
    },
    noLink: Boolean,
})

const smallTextCharacters = {'en':19, 'jp':10, 'kr':11, 'tw':10, 'cn':10, 'zh':10, 'th': 20, 'vi': 20};
const settings = useSettingsStore().settings;

const label = computed(() => {
    return `#${props.timeAttack.Id} ${translate("TimeAttackStage", props.timeAttack.DungeonType)}`;
})

const rules = computed(() => {
    return props.timeAttack.Rules[props.timeAttack.Rules.length - 1].map(rule => getTimeAttackRule(rule.Id).Icon);
})

</script>

<template>
    <component :is="noLink ? 'div' : 'RouterLink'" :to="{name: `timeattackview`, params: { 'raidid': timeAttack.Id }}" class="selection-grid-card card-raid">
        <div class="card-bg">
            <div :style="{backgroundImage: `url('/images/timeattack/BG_0${(timeAttack.Id - 1) % 3}.png')`}"></div>
        </div>
        <div class="card-img ta-img">
            <img :src="`/images/enemy/${timeAttack.Icon}.webp`">
        </div>
        <div class="card-badge ta-rules">
            <img v-for="rule in rules" :src="`/images/timeattack/${rule}.webp`">
        </div> 
        <div class="card-label">
            <span class="label-text" :class="{smalltext: label.length > smallTextCharacters[settings.language]}">{{ label }}</span>
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