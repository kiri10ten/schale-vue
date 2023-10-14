<script setup>
import { reactive, ref } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { useSettingsStore } from '../../stores/SettingsStore';
import { getDuration } from '../../composables/Utilities';
import { now } from 'lodash';

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

setInterval(updateTime, 1000);

</script>

<template>
<div style="width: 600px">
    <h3>{{ translateUi('current_events', translate('ServerName', settings.server)) }}</h3>
    <p>Server Reset in <b>{{ nextResetIn }}</b> (<b>{{ nextResetTime }}</b>)</p>
</div>
</template>