<script setup>
import { computed } from 'vue';
import { translateUi } from '../../../composables/Localization';
import { useSettingsStore } from '../../../stores/SettingsStore';
import { distanceString, framesString } from '../../../composables/Utilities';

const settings = useSettingsStore().settings;

const props = defineProps({
    skill: {
        type: Object,
        required: true
    }
});

const tags = computed(() => {

    const radiusInfo = [];
    let range = props.skill.Range;

    props.skill.Radius?.forEach((radius) => {

        switch (radius.Type) {
            case 'Circle':
                radiusInfo.push({
                    label: distanceString(radius.Radius),
                    tooltip: `${translateUi('radius')}: <b>${radius.Radius / 100}m (${radius.Radius})</b>`,
                    icon: 'COMMON_SKILLICON_CIRCLE'
                });
                if (radius.Radius == range) range = 0;
                break;
            case 'Donut':
                radiusInfo.push({
                    label: `${distanceString(radius.ExcludeRadius)} - ${distanceString(radius.Radius)}`,
                    tooltip: `${translateUi('radius')}: <b>${radius.ExcludeRadius / 100}m - ${radius.Radius / 100}m (${radius.ExcludeRadius} - ${radius.Radius})</b>\n${translateUi('angle')}: <b>${radius.Degree}&deg;</b>`,
                    icon: 'COMMON_SKILLICON_DONUT'
                });
                range = 0;
                break;
            case 'Fan':
                radiusInfo.push({
                    label: distanceString(radius.Radius),
                    tooltip: `${translateUi('radius')}: <b>${radius.Radius / 100}m (${radius.Radius})</b>\n${translateUi('angle')}: <b>${radius.Degree}&deg;</b>`,
                    icon: 'COMMON_SKILLICON_FAN'
                });
                range = 0;
                break;
            case 'Obb':
                radiusInfo.push({
                    label: radius.Height > radius.Width ? distanceString(radius.Height) : `${distanceString(radius.Width)} &times; ${distanceString(radius.Height)}`,
                    tooltip: `${translateUi('length')}: <b>${radius.Height / 100}m (${radius.Height})</b>\n${translateUi('width')}: <b>${radius.Width / 100}m (${radius.Width})</b>`,
                    icon: radius.Height > radius.Width ? 'COMMON_SKILLICON_LINE' : 'COMMON_SKILLICON_RECZONE'
                });
                if (radius.Height >= range) range = 0;
                break;
            case 'Bounce':
                radiusInfo.push({
                    label: distanceString(radius.Radius),
                    tooltip: `${translateUi('bounce')}: <b>${radius.Radius / 100}m (${radius.Radius})</b>`,
                    icon: 'COMMON_SKILLICON_BOUNCEPROJECTILE'
                });
                break;
        }  

    });

    return { radius: radiusInfo, range };

})

</script>


<template>
    <div v-for="radius of tags.radius" class="ba-info-pill-s bg-theme" v-tooltip="radius.tooltip">
        <img class="icon invert-light" :src="`/images/skill/${radius.icon}.webp`">
        <span class="label" v-html="radius.label"></span>
    </div>
    <div v-if="tags.range" class="ba-info-pill-s bg-theme" v-tooltip="translateUi('range') + `: <b>${tags.range / 100}m (${tags.range})</b>`">
        <div class="icon">
            <inline-svg class="stat-icon-svg" :src="`/images/staticon/svg/Range.svg`"></inline-svg>
        </div>
        <span class="label">{{ distanceString(tags.range) }}</span>
    </div>
    <div v-if="skill.Duration" class="ba-info-pill-s bg-theme"
    v-tooltip="translateUi('skill_duration') + `:\n<b>${translateUi('time_seconds_frames', +(skill.Duration / 30).toFixed(2), skill.Duration)}</b>`">
        <img class="icon invert-light py-1" src="/images/ui/Common_Icon_Time.png">
        <span class="label">{{ framesString(skill.Duration) }}</span>
    </div>
</template>

<style scoped lang="scss">
.icon {
    
    display: flex;
    align-items: center;
    
    .stat-icon-svg {
        margin-left: 0.25rem;
        min-width: 18px;
        width: 18px;
        height: 18px;
        padding: 0px;
    }
}

</style>