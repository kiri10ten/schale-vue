<script setup>
import { translate, translateUi } from '../../composables/Localization';
import { getStudentById, studentMap } from '../../composables/Student';
import { useSettingsStore } from '../../stores/SettingsStore';
import { useStudentStore } from '../../stores/StudentStore';

import StudentRenderSkills from './StudentRenderSkills.vue';
import StudentRenderProfile from './StudentRenderProfile.vue';
import StudentRenderStats from './StudentRenderStats.vue';
import StudentRenderWeapon from './StudentRenderWeapon.vue';
import StudentRenderGear from './StudentRenderGear.vue';
import { computed, ref, toRefs, watch } from 'vue';
import { breakpointsBootstrapV5, useBreakpoints, useMediaQuery } from '@vueuse/core';
import StudentRenderVoice from './StudentRenderVoice.vue';

const props = defineProps({
    student: {
        type: Object,
        required: true,
        default(rawProps) {
            return getStudentById(10000)
        }
    }

});

const viewAltSprite = ref(false);

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const useThreeCol = useMediaQuery('(min-width: 1800px)');
const mobileView = breakpoints.smaller('md');

const settings = useSettingsStore().settings;
const studentStore = useStudentStore();
const activeTab = toRefs(studentStore.studentDisplay).ActiveTab;

const inCollection = computed(() => {
    return studentStore.collectionExists(props.student.Id);
})

const inFavourites = computed(() => {
    return studentStore.favouritesExists(props.student.Id);
})

const isLocked = computed(() => {
    return studentStore.collectionLocked(props.student.Id);
})

function toggleCollection() {
    if (inCollection.value) {
        studentStore.collectionRemove(props.student.Id);
    } else {
        studentStore.collectionUpdate(props.student.Id, ...props.student.FavorAlts);
    }
}

if (useThreeCol.value && activeTab.value == 'stats') {
    activeTab.value = 'skills';
}

watch(useThreeCol, (newVal) => {
    if (newVal && activeTab.value == 'stats') {
        activeTab.value = 'skills';
    }
})

</script>

<template>
    <div class="py-md-3 page" :class="{'g-0': mobileView, 'container-fluid' : useThreeCol, 'container-xl': !useThreeCol}">
        <div class="d-flex h-100" :class="{'flex-column': mobileView}">
            <div id="student-portrait-panel" class="ba-page">
                <div class="d-flex pe-xl-3" style="justify-content: center;">
                    <img id="ba-student-img" :src="`/images/student/portrait/${student.Id}${student.AltSprite && viewAltSprite ? '_2' : ''}.webp`">
                </div>
                <div class="student-portrait-buttons">
                    <RouterLink id="ba-student-list-btn" tag="button" class="btn-pill" :to="{name: 'studentlistview'}">
                        <font-awesome-icon :icon="['fas', 'arrow-left']" class="ms-2"/>
                        <span class="label d-none d-md-inline">{{ translateUi('student_list') }}</span>
                        <span class="label d-inline d-md-none">{{ translateUi('student_list_short') }}</span>
                    </RouterLink>
                    <button type="button" class="btn-pill" :class="{active: inCollection}" @click="toggleCollection">
                        <fa :icon="inCollection ? 'circle-check' : 'circle-plus'" class="ms-2" />
                        <span class="label" v-html="inCollection ? 'Remove' : 'Add'"></span>
                    </button>
                    <!-- <button v-if="inCollection" type="button" class="btn-pill" :class="{active: isLocked}" @click="studentStore.collectionLock(student.Id);">
                        <span class="label">
                            <fa :icon="isLocked ? 'lock' : 'lock-open'" class="mx-1" />
                        </span>
                    </button> -->
                    <div class="dropdown">
                        <button class="btn-pill" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                            <fa icon="ellipsis-vertical" class="ms-2" />
                            <span class="label">
                                More
                            </span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-start">
                            <li>
                                <button class="dropdown-item" :class="{active: inFavourites}" @click="studentStore.favouritesToggle(student.Id);">
                                    <span class="label">
                                        <fa icon="heart" class="me-2" />{{ translateUi(inFavourites ? 'favourites_remove' : 'favourites_add') }}
                                    </span>
                                </button>
                            </li>
                            <li v-if="inCollection">
                                <button class="dropdown-item" :class="{active: isLocked}" @click="studentStore.collectionLock(student.Id);">
                                    <span class="label">
                                        <fa :icon="isLocked ? 'lock' : 'lock-open'" class="me-2" />Lock Collection Stats
                                    </span>
                                </button>
                                <p class="text-muted mx-3 my-1"><small>Prevents changes to the student's stats from saving while locked.</small></p>
                            </li>
                            <li v-if="student.AltSprite">
                                <button class="dropdown-item" :class="{active: viewAltSprite}" @click="viewAltSprite = !viewAltSprite">
                                    <span class="label"><fa icon="repeat" class="me-2" />{{ translateUi('tooltip_sprite_toggle') }}</span>
                                </button>
                            </li>
                            <li>
                                <a class="dropdown-item dropdown-item-icon" :href="`https://hina.loves.midokuni.com/StudentInsights/${student.Id}`" target="_blank">
                                    <div class="icon"><img :src="'/images/ui/midokuni.png'"></div>
                                    <span class="label">Midokuni Insights<fa icon="external-link" class="ms-2"/></span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <!-- 
                    <button id="ba-student-toggle-sprite-btn" type="button" class="btn btn-dark tooltip-button" data-tooltip-id="ui,tooltip_sprite_toggle"><font-awesome-icon :icon="['fas', 'repeat']" /></button>
                    <button id="student-voice-btn" type="button" class="btn btn-dark tooltip-button" data-tooltip-id="ui,voicegallery"><font-awesome-icon :icon="['fas', 'microphone']" /></button>
                    <button id="btn-midokuni-link" class="btn btn-dark tooltip-button py-1 px-2" v-tooltip="translateUi('midokuni_link')">
                        <div class="icon"><img src="/images/ui/midokuni.png" width="25" height="25"></div>
                    </button> -->
                </div>

                <div class="d-block d-md-none" style="height: 412px;"></div>
            </div>
            <div class="flex-fill card ba-page h-100">
                <div class="d-flex h-100 main-panel">
                    <div class="left-column">
                        <div class="d-flex flex-column gap-2 h-100">
                            <div class="d-flex flex-row align-items-top p-2">
                                <div class="flex-grow-1">
                                    <h1 id="ba-student-name" class="title-text px-1 mb-3" v-html="student.Name.replace(/([(（].+[)）])/,'<small>$1</small>')"></h1>
                                    <div class="d-flex flex-row flex-wrap gap-1">
                                        <span id="ba-student-stargrade" class="ba-info-pill-s bg-theme">
                                            <span class="label">
                                                <font-awesome-icon v-for="n in student.StarGrade" :icon="['fas', 'star']" />
                                                <span v-if="student.IsLimited" class="ms-1">({{ translate('IsLimited', student.IsLimited) }})</span>
                                            </span>
                                        </span>
                                        <span id="ba-student-class" class="ba-info-pill-s" :class="`ba-class-${student.SquadType.toLowerCase()}`"><span class="label"><span class="font-nexon">{{ translate('SquadType', student.SquadType) }}</span></span></span>
                                        <div class="ba-info-pill-s bg-theme px-2 text-muted align-self-center" :class="{'ms-auto': useThreeCol}" v-if="settings.showDeveloperProps">{{ student.Id }} / {{ student.DevName }}</div>
                                    </div>
                                </div>
                                <!-- <div id="ba-student-school" v-show="!useThreeCol">
                                    <img id="ba-student-school-img" class="invert-light" width="84" height="76" :src="`/images/schoolicon/${student.School}.png`">
                                </div> -->
                            </div>
                            <div v-if="useThreeCol" class="p-2 scroll-auto">
                                <StudentRenderStats :student="student" />
                            </div>                            
                        </div>

                    </div>
                    <div class="flex-fill d-flex flex-column h-100">
                        <nav id="ba-item-list-tabs" class="nav nav-pills p-2" :class="{'justify-content-center mb-2': useThreeCol}">
                            <button class="nav-link" v-if="!useThreeCol" @click="activeTab = 'stats'" :class="{'active': activeTab == 'stats'}">{{ translateUi('attributes') }}</button>
                            <button class="nav-link" @click="activeTab = 'skills'" :class="{'active': activeTab == 'skills'}">{{ translateUi('skills') }}</button>
                            <button class="nav-link" @click="activeTab = 'weapon'" :class="{'active': activeTab == 'weapon'}">{{ translateUi('ex_weapon') }}</button>
                            <button class="nav-link" @click="activeTab = 'gear'" :class="{'active': activeTab == 'gear'}" v-if="student.Gear.Released?.[settings.server]">{{ translateUi('ex_gear') }}</button>
                            <button class="nav-link" @click="activeTab = 'profile'" :class="{'active': activeTab == 'profile'}">{{ translateUi('profile') }}</button>
                            <button class="nav-link" @click="activeTab = 'voice'" :class="{'active': activeTab == 'voice'}">{{ translateUi('voice') }}Voice</button>
                        </nav>
                        <div class="tab-content flex-fill p-2 scroll-auto">
                                <StudentRenderStats v-if="activeTab == 'stats' && !useThreeCol" :student="student" />
                                <StudentRenderSkills v-if="activeTab == 'skills'" :student="student" />
                                <StudentRenderWeapon v-if="activeTab == 'weapon'" :student="student" />
                                <StudentRenderGear v-if="activeTab == 'gear'" :student="student" />
                                <StudentRenderProfile v-if="activeTab == 'profile'" :student="student" />
                                <StudentRenderVoice v-if="activeTab == 'voice'" :student="student" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

@mixin three-col() {
    @media only screen and (min-width: (1800px)) {
        @content;
    }
}

#ba-item-list-tabs {
    @include sm-down {
        flex-wrap: nowrap;
        overflow-x: scroll;
        scrollbar-width: none;
        
        &::-webkit-scrollbar {
            display: none;
        }
    }
}

.card {
    
    padding: 0.5rem;

    @include sm-down {
        border-radius: 0px;
        padding: 0.5rem 0;
    }
}

.page {
    @include three-col{
        height: calc(100vh - 56px);
    }
}

.left-column {
    @include three-col{
        min-width: 582px;
        max-width: 582px
    } 
}

.main-panel {
    flex-direction: column;

    @include three-col{
        gap: 1rem;
        flex-direction: row;
    } 
}

#student-portrait-panel {

    min-width: 50%;

    @include three-col{
        min-width: 720px;
    }
}

.student-portrait-buttons .btn-pill {
    height: 36px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.scroll-auto {
    @include scrollable(auto);
}

</style>