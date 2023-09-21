<script setup>
import { translate, translateUi } from '../../composables/Localization';
import { getStudentById, studentMap } from '../../composables/Student';
import { useSettingsStore } from '../../stores/SettingsStore';

import StudentRenderSkills from './StudentRenderSkills.vue';
import StudentRenderProfile from './StudentRenderProfile.vue';
import StudentRenderStats from './StudentRenderStats.vue';
import StudentRenderWeapon from './StudentRenderWeapon.vue';
import StudentRenderGear from './StudentRenderGear.vue';

const props = defineProps({
    student: {
        type: Object,
        required: true,
        default(rawProps) {
            return getStudentById(10000)
        }
    }

});

const settings = useSettingsStore().settings;

</script>

<template>
    <div class="container-xl py-md-3">
        <div class="row">
            <div id="student-portrait-panel" class="col-12 col-md-6 ba-page">
                <div class="d-flex pe-xl-3" style="justify-content: center;">
                    <img id="ba-student-img" :src="`/images/student/portrait/${student.Id}.webp`">
                </div>
                <div class="student-portrait-buttons">
                    <RouterLink id="ba-student-list-btn" tag="button" class="btn btn-dark" :to="{name: 'studentlistview'}">
                        <font-awesome-icon :icon="['fas', 'chevron-left']" />
                        <span class="ms-2 d-none d-md-inline">{{ translateUi('student_list') }}</span>
                        <span class="d-inline d-md-none">{{ translateUi('student_list_short') }}</span>
                    </RouterLink>
                    <!-- <button id="ba-student-collection-btn" type="button" class="btn btn-dark" onclick="toggleOwned()"></button>
                    <div class="d-md-none flex-fill"></div>
                    <button id="ba-student-toggle-sprite-btn" type="button" class="btn btn-dark tooltip-button" data-tooltip-id="ui,tooltip_sprite_toggle"><font-awesome-icon :icon="['fas', 'repeat']" /></button>
                    <button id="student-voice-btn" type="button" class="btn btn-dark tooltip-button" data-tooltip-id="ui,voicegallery"><font-awesome-icon :icon="['fas', 'microphone']" /></button>
                    <button id="btn-midokuni-link" class="btn btn-dark tooltip-button py-1 px-2" v-tooltip="translateUi('midokuni_link')">
                        <div class="icon"><img src="/images/ui/midokuni.png" width="25" height="25"></div>
                    </button> -->
                </div>
                <!-- <div class="d-flex flex-wrap gap-1">
                    <RouterLink v-for="student in studentMap" :to="{name: 'studentview', params: {studentid: student.Id }}" tag="button" class="btn btn-dark">
                        <span>{{ student.Name }}</span>
                    </RouterLink>
                </div> -->
                <div class="d-block d-md-none" style="height: 412px;"></div>
            </div>
            <div id="ba-student" class="col-12 col-md-6 ba-page">
                <div class="px-0 ps-xl-3">
                    <div class="card p-2">
                        <div class="card-header">
                            <div class="d-flex flex-row align-items-top pt-2 pb-3">
                                <div class="flex-grow-1 me-2">
                                    <h1 id="ba-student-name" class="title-text px-1 mb-3" v-html="student.Name.replace(/([(（].+[)）])/,'<small>$1</small>')"></h1>
                                    <div class="d-flex flex-row flex-wrap gap-1">
                                        <span id="ba-student-stargrade" class="ba-info-pill-s bg-theme">
                                            <span class="label">
                                                <font-awesome-icon v-for="n in student.StarGrade" :icon="['fas', 'star']" />
                                                <span v-if="student.IsLimited" class="ms-1">({{ translate('IsLimited', student.IsLimited) }})</span>
                                            </span>
                                        </span>
                                        <span id="ba-student-class" class="ba-info-pill-s" :class="`ba-class-${student.SquadType.toLowerCase()}`"><span class="label">{{ translate('SquadType', student.SquadType) }}</span></span>
                                    </div>
                                </div>
                                <div id="ba-student-school">
                                    <img id="ba-student-school-img" class="invert-light" width="84" height="76" :src="`/images/schoolicon/${student.School}.png`">
                                </div>
                            </div>
                            <nav id="ba-item-list-tabs" class="nav nav-pills justify-content-left">
                                <a class="nav-link active" data-bs-toggle="tab" href="#stats">{{ translateUi('attributes') }}</a>
                                <a class="nav-link" data-bs-toggle="tab" href="#skills">{{ translateUi('skills') }}</a>
                                <a class="nav-link" data-bs-toggle="tab" href="#weapon">{{ translateUi('ex_weapon') }}</a>
                                <a v-if="student.Gear.Released?.[settings.server]" class="nav-link" data-bs-toggle="tab" href="#gear">{{ translateUi('ex_gear') }}</a>
                                <a class="nav-link" data-bs-toggle="tab" href="#profile">{{ translateUi('profile') }}</a>
                            </nav>
                        </div>
                        <div class="card-body">
                            <div class="tab-content">
                                <div id="stats" class="tab-pane show active">
                                    <StudentRenderStats :student="student" />
                                </div>

                                <div id="skills" class="tab-pane">
                                    <StudentRenderSkills :student="student" />
                                </div>

                                <div id="weapon" class="tab-pane">
                                    <StudentRenderWeapon :student="student" />
                                </div>

                                <div id="gear" class="tab-pane">
                                    <StudentRenderGear v-if="student.Gear.Released?.[settings.server]" :student="student" />
                                </div>

                                <div id="profile" class="tab-pane">
                                    <StudentRenderProfile :student="student" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>