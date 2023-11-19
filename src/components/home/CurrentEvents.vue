<script setup>
import { now } from 'lodash';
import { computed, reactive, ref } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { getStudentById } from '../../composables/Student';
import { getDuration } from '../../composables/Utilities';
import { useSettingsStore } from '../../stores/SettingsStore';
import StudentListItem from '../student/StudentListItem.vue';

const settings = useSettingsStore().settings;

const currentTime = reactive(new Date())
const nextResetIn = ref('');
const nextResetTime = ref('');

updateTime();

function updateTime() {
    currentTime.setTime(now());
    const reset = new Date();
    reset.setUTCHours(settings.server == 2 ? 22 : 19, 0, 0, 0);
    if (reset < currentTime) {
        reset.setUTCDate(reset.getUTCDate() + 1);
    }
    nextResetTime.value = reset.toLocaleTimeString([], {hour: "numeric", minute: "numeric", timeZoneName: "short"});
    const duration = getDuration(Math.round((reset - currentTime) / 1000));
    nextResetIn.value = `${String(duration.hours).padStart(2, '0')}:${String(duration.minutes).padStart(2, '0')}:${String(duration.seconds).padStart(2, '0')}`;
}

const visibleBanner = ref(0);

const gachaBanners = computed(() => {
    const currentTs = currentTime.getTime() / 1000
    return regionSettings.value.CurrentGacha.filter((banner) => currentTs >= banner.start && currentTs < banner.end);
})

function timestampToDateString(timestamp) {
    return new Date(timestamp * 1000).toLocaleString([], { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", timeZoneName: "short" })
}

function eventEndingTime(timestamp) {
    const endTime = new Date(timestamp * 1000)
    const duration = getDuration(Math.round((endTime - currentTime) / 1000));
    return translateUi('event_ends', duration.days, duration.hours, duration.minutes );
}

setInterval(updateTime, 1000);

</script>

<template>
<div>
    <h3>{{ translateUi('current_events', translate('ServerName', settings.server)) }}</h3>
    <p>Server Reset in <b>{{ nextResetIn }}</b> (<b>{{ nextResetTime }}</b>)</p>

    <div class="ba-panel p-2 text-center">
        <h5>{{ translateUi('gacha_pickup') }}</h5>
        <div class="selection-grid student selection-grid-flex mb-2">
            <StudentListItem v-for="studentId in gachaBanners[visibleBanner].characters" :student="getStudentById(studentId)" :card-width="100" :card-height="113"></StudentListItem>
        </div>
        <p class="m-0">{{ timestampToDateString(gachaBanners[visibleBanner].start) }} - {{ timestampToDateString(gachaBanners[visibleBanner].end) }}</p>
        <p class="mb-1" v-html="eventEndingTime(gachaBanners[visibleBanner].end)"></p>
    </div>
</div>
</template>