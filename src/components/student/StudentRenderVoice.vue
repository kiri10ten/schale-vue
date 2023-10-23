<script setup>
import { computed, ref } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { getVoiceById } from '../../composables/Voice';
import { useDataStore } from '../../stores/DataStore';

const staticAssetURL = "https://static.schale.gg"
const dataLoaded = ref(false);
const activeTab = ref('Normal');

const props = defineProps({
    student: {
        type: Object,
        required: true
    }
});

useDataStore().ensureData('voice').then(() => {
    dataLoaded.value = true;
})

const voiceRenderData = computed(() => {
    if (dataLoaded.value) {
        const voice = {}
        const voiceData = getVoiceById(props.student.Id);

        for (const category in voiceData) {
            voice[category] = [];
            for (const vc of voiceData[category]) {
                if (vc.EventId && !regionSettings.value.Events.includes(vc.EventId)) continue;
                if (vc.Group == "WeaponGetIdle1" && !regionSettings.value.WeaponUnlocked) continue;

                const matches = vc.Group.match(/([0-9])$/);
                const order = matches && matches.length ? matches[1] : 1;
                const group = vc.Group.replace(/[0-9]$/, "");

                voice[category].push({
                    Name: translate('VoiceClip', group, order),
                    AudioClip: `${staticAssetURL}/voice/${vc.AudioClip}`,
                    Transcription: vc.Transcription ?? null
                })
            }
        }

        if (voiceData[activeTab.value].length == 0) {
            activeTab.value = 'Normal';
        }

        return voice

    } else return {};
})

</script>

<template>
    <div v-if="dataLoaded" class="d-flex flex-column gap-3 h-100" style="overflow: hidden;">
        <div class="d-flex align-items-center flex-wrap justify-content-between">
            <div id="student-voice-info" class="d-flex align-items-start flex-column">
                <div>
                    <fa icon="microphone-lines" class="me-1" /><b class="me-2">JP</b>
                    <span class="text-italic">{{ student.CharacterVoice.split('/')[0] }}</span>
                </div>
                <div v-if="student.CharacterVoice.split('/').length > 1">
                    <fa icon="microphone-lines" class="me-1" /><b class="me-2">CN</b>
                    <span class="text-italic">{{ student.CharacterVoice.split('/')[1] }}</span>
                </div>
            </div>

            <nav id="voicegallery" class="nav nav-pills justify-content-center">
                <template v-for="(value, key) in voiceRenderData">
                    <button v-if="value.length" class="nav-link" @click="activeTab = key" :class="{'active': activeTab == key}">
                        {{ translate('VoiceClipGroup', key) }}
                    </button>
                </template>
            </nav>
        </div>


        <div class="py-2 d-flex flex-column gap-2 voice-list">
        
            <template v-for="voice in voiceRenderData[activeTab]">
                <div class="d-flex flex-row align-items-center gap-2">
                    <h6 class="m-0">{{ voice.Name }}</h6>
                    <div class="flex-fill"></div>
                    <audio preload="none" controls>
                        <source :src="voice.AudioClip" type="audio/mpeg">
                    </audio>
                </div>

                <div v-if="voice.Transcription" class="ba-panel p-2">
                    <p class="m-0">{{ voice.Transcription }}</p>
                </div>
            </template>

        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.voice-list {
    padding-right: 0.5rem;
    @include scrollable(auto);
}

</style>