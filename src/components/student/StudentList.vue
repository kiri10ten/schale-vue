<script setup>
import { computed, reactive, ref, toRefs, watch } from 'vue';
import { breakpointsBootstrapV5, useBreakpoints, useElementSize, useMediaQuery } from '@vueuse/core'
import { studentMap, studentsGenerator } from '../../composables/Student';
import { useSettingsStore } from '../../stores/SettingsStore';
import StudentListItem from './StudentListItem.vue';
import { translate, translateUi } from '../../composables/Localization';
import { useStudentStore } from '../../stores/StudentStore';
import { terrainList, adaptationGrade, terrainAffinityText } from '../../composables/TerrainHelper';
import { getMaximumAttributes } from '../../composables/StudentList';
import ListSort from '../common/ListSort.vue';
import { extractNumber } from '../../composables/Utilities';
import { RecycleScroller } from 'vue-virtual-scroller';
import { getSchoolIconName } from '../../composables/Icon';

const settings = useSettingsStore().settings;
const filters = useStudentStore().studentListFilters;
const sortOption = useStudentStore().studentListSort;

const scrollerKey = ref(1);

const breakpoints = useBreakpoints(breakpointsBootstrapV5);
const useOffCanvas = breakpoints.smaller('md');
const showFloatingSortOption = useMediaQuery('(min-width: 480px)');

const filtersClass = computed(() => {
    return useOffCanvas.value ? '' : 'card screen-height sidebar';
})

const statCache = reactive({
    max: {},
    collection: {}
});

const sortOptions = [
    {key: 'Id', label: translateUi('default'), type: 'number', noLabelText: true},
    {key: 'DefaultOrder', label: translateUi('release_date'), type: 'number', noLabelText: true},
    {key: 'Name', label: translateUi('name'), type: 'string', noLabelText: true},
    {key: 'MaxHP', label: translate('Stat', 'MaxHP'), type: 'stat', header: translateUi('max_stats')},
    {key: 'AttackPower', label: translate('Stat', 'AttackPower'), type: 'stat'},
    {key: 'HealPower', label: translate('Stat', 'HealPower'), type: 'stat'},
    {key: 'DefensePower', label: translate('Stat', 'DefensePower'), type: 'stat'},
    {key: 'AccuracyPoint', label: translate('Stat', 'AccuracyPoint'), type: 'stat'},
    {key: 'DodgePoint', label: translate('Stat', 'DodgePoint'), type: 'stat'},
    {key: 'CriticalPoint', label: translate('Stat', 'CriticalPoint'), type: 'stat'},
    {key: 'StabilityPoint', label: translate('Stat', 'StabilityPoint'), type: 'stat'},
    {key: 'Range', label: translate('Stat', 'Range'), type: 'stat'},
    {key: 'UseCollectionStats', label: translateUi('collection_stats')},
    {key: 'StreetBattleAdaptation', label: translateUi('terrain_adaption', translate('AdaptationType', 'Street')), type: 'adaptation', terrain: 'Street', reverseSort: true, header: translateUi('attributes')},
    {key: 'OutdoorBattleAdaptation', label: translateUi('terrain_adaption', translate('AdaptationType', 'Outdoor')), type: 'adaptation', terrain: 'Outdoor', reverseSort: true},
    {key: 'IndoorBattleAdaptation', label: translateUi('terrain_adaption', translate('AdaptationType', 'Indoor')), type: 'adaptation', terrain: 'Indoor', reverseSort: true},
    {
        key: 'EXCost',
        sortOrderFunc: (student) => {
            return student.Skills.Ex.Cost[4];
        },
        labelTextFunc: (student) => {
            const cost = student.Skills.Ex.Cost;
            return cost[0] == cost[4] ? `${cost[4]}` : `${cost[0]} → ${cost[4]}`;
        },
        label: translate('Stat', 'SkillCost'),
        type: 'number'
    },
    {
        key: 'NormalHits',
        sortOrderFunc: (student) => {
            return getSkillHits(student.Skills.Normal);
        },
        label: translate('Stat', 'NormalHits'),
        type: 'number',
        reverseSort: true
    },
    {
        key: 'EXHits',
        sortOrderFunc: (student) => {
            return getSkillHits(student.Skills.Ex);
        },
        label: translate('Stat', 'EXHits'),
        type: 'number',
        reverseSort: true
    },
    {
        key: 'PublicHits',
        sortOrderFunc: (student) => {
            return getSkillHits(student.Gear.Released?.[settings.server] ? student.Skills.GearPublic : student.Skills.Public);
        },
        labelTextFunc: (student) => {
            if (student.Gear.Released?.[settings.server]) {
                const publicHits = getSkillHits(student.Skills.Public);
                const gearPublicHits = getSkillHits(student.Skills.GearPublic);
                return gearPublicHits > publicHits ? `${publicHits} → ${gearPublicHits}` : gearPublicHits;
            } else {
                return getSkillHits(student.Skills.Public);
            }
        },
        label: translate('Stat', 'PublicHits'),
        type: 'number',
        reverseSort: true
    },
    {key: 'School', label: translateUi('school'), sortOrderFunc: (student) => translate('School', student.School), type: 'string', header: translateUi('profile')},
    {key: 'Club', label: translateUi('club'), sortOrderFunc: (student) => translate('Club', student.Club), type: 'string'},
    {key: 'CharacterVoice', label: translateUi('cv'), type: 'string'},
    {
        key: 'BirthDay',
        label: translateUi('birthday'),
        sortOrderFunc: (student) => new Date(0, parseInt(student.BirthDay.split('/')[0])-1, parseInt(student.BirthDay.split('/')[1])),
        labelTextFunc: (student) => new Date(0, parseInt(student.BirthDay.split('/')[0])-1, parseInt(student.BirthDay.split('/')[1])).toLocaleDateString([], { month: "numeric", day: "numeric"}),
        type: 'date'
    },
    {
        key: 'CharacterAge',
        label: translateUi('age'),
        sortOrderFunc: (student) => extractNumber(student.CharacterAge),
        labelTextFunc: (student) => {
            const age = extractNumber(student.CharacterAge);
            return age > 0 ? age : '??';
        },
        type: 'number'
    },
    {
        key: 'CharHeight',
        label: translateUi('height'),
        sortOrderFunc: (student) => extractNumber(student.CharHeightMetric),
        labelTextFunc: (student) => settings.preferredUnits == 'metric' ? student.CharHeightMetric : student.CharHeightImperial,
        type: 'number'
    },
    {key: 'Illustrator', label: translateUi('illustrator'), type: 'string'},
    {key: 'Designer', label: translateUi('designer'), type: 'string'},
    {
        key: 'MemoryLobby',
        label: translateUi('memory_lobby_unlock_level'),
        sortOrderFunc: (student) => student.MemoryLobby[settings.server],
        labelTextFunc: (student) => `${student.MemoryLobby[settings.server]}`,
        type: 'number'
    },
    {
        key: 'MemoryLobbyBGM',
        label: translateUi('memory_lobby_bgm_name'),
        sortOrderFunc: (student) => translate('BGM', student.MemoryLobbyBGM) ?? `Theme ${student.MemoryLobbyBGM}`,
        labelTextFunc: (student) => translate('BGM', student.MemoryLobbyBGM) ?? `Theme ${student.MemoryLobbyBGM}`,
        type: 'string'},
]

function getSkillHits(skill) {
    if (!skill || !skill.Effects) return 0;
    const effectWithHits = skill.Effects.find(e => (e.Type == "DMGMulti" || e.Type == "DMGZone") && e.Hits !== undefined);
    if (effectWithHits === undefined) {
        return (skill.Effects.find(e => e.Type == "DMGSingle") !== undefined) ? 1 : 0;
    } else {
        return effectWithHits.Hits.length;
    }
}

const activeFilters = computed(() => {
    const activeFilters = {};
    for (const key in filters) {

        if (key == 'ShowInfo') {
            continue;
        }

        if (typeof filters[key] === 'object') {

            const filterValues = [];

            for (const val in filters[key]) {
                
                if (filters[key][val] === true) {
                    filterValues.push(isNaN( Number(val) ) ? val : Number(val));
                }
            }

            if (filterValues.length) {
                activeFilters[key] = filterValues;
            }

        } else {

            if (filters[key] === true) {
                activeFilters[key] = [true];
            }

        }


    }

    return activeFilters;
})

const studentListEl = ref(null);
const listWidth = useElementSize(studentListEl).width;

const cardMargin = computed(() => {
    return useOffCanvas.value ? 8 : 16;
})

const cardWidth = computed(() => {
    return useOffCanvas.value ? 80 : 100;
})

const cardHeight = computed(() => {
    return useOffCanvas.value ? 90 : 113;
})

const gridColumns = computed(() => {
    return Math.floor(listWidth.value / (cardWidth.value + cardMargin.value));
    
})
const gridItemWidth = computed(() => {
    return Math.floor(listWidth.value / gridColumns.value);
})


const resultStudentList = computed(() => {

    const studentList = [];
    for (const student of studentsGenerator()) {

        let add = true;

        if (!student.IsReleased[settings.server]) {
            continue;
        }

        if (filters.SearchTerm !== "" && !student.Name.toLowerCase().includes(filters.SearchTerm.toLowerCase())) {
            continue;
        }

        for (const key in activeFilters.value) {

            let prop;

            if (key.startsWith('Equipment')) {
                prop = student.Equipment[Number(key.slice(-1)) - 1];
            } else if (key === 'Gear') {
                prop = student.Gear.Released?.[settings.server];
            } else if (key === 'Collection') {
                prop = useStudentStore().collectionExists(student.Id) ? 'Owned' : 'NotOwned';
            } else if (key === 'Favourite') {
                prop = useStudentStore().favouritesExists(student.Id);
            } else {
                prop = student[key];

                if (typeof prop === 'boolean') {
                    prop = String(prop);
                }
                
            }

            if (!(activeFilters.value[key].includes(prop))) {
                add = false
                break;
            }

        }

        if (add) {
            let sortOrder = 0;
            let labelText = null;
            if (currentSortOption.value.type == 'adaptation') {
                const adaptationBase = student[currentSortOption.value.key];
                
                if (student.Weapon.AdaptationType === currentSortOption.value.terrain) {
                    sortOrder = adaptationBase + student.Weapon.AdaptationValue - 0.1;
                    labelText = `${adaptationGrade[adaptationBase]} → ${adaptationGrade[adaptationBase + student.Weapon.AdaptationValue]}`
                } else {
                    sortOrder = adaptationBase;
                    labelText = adaptationGrade[adaptationBase];
                }

            } else if (currentSortOption.value.type == 'stat') {

                const cache = sortOption.UseCollectionStats ? statCache.collection : statCache.max;

                if (!cache[student.Id]) {
                    cache[student.Id] = getMaximumAttributes(student, sortOption.UseCollectionStats);
                }

                sortOrder = cache[student.Id][currentSortOption.value.key];
                labelText = sortOrder == 0 ? translateUi('collection_notowned') : sortOrder.toLocaleString();
            } else {

                if (currentSortOption.value.sortOrderFunc) {
                    sortOrder = currentSortOption.value.sortOrderFunc(student);
                } else {
                    sortOrder = student[currentSortOption.value.key];
                }

                if (currentSortOption.value.labelTextFunc) {
                    labelText = currentSortOption.value.labelTextFunc(student);
                } else {
                    
                    labelText = currentSortOption.value.noLabelText == true ? null : sortOrder;
                }
                
            }

            studentList.push(
                {
                    SortOrder: sortOrder,
                    LabelText: labelText,
                    Id: student.Id,
                    PathName: student.PathName,
                    SquadType: student.SquadType,
                    TacticRole: student.TacticRole,
                    Name: student.Name,
                    BulletType: student.BulletType,
                    ArmorType: student.ArmorType,
                    StarGrade: student.StarGrade,
                    IsLimited: student.IsLimited
                }
            );
        }
    }

    switch (currentSortOption.value.type) {
        case 'string':
            studentList.sort((a, b) => (a.SortOrder.localeCompare(b.SortOrder)) * sortOption.Mode);
            break;

        case 'stat':
            studentList.sort((a, b) => (a.SortOrder - b.SortOrder) * (-sortOption.Mode));
            break;

        default:
            studentList.sort((a, b) => (a.SortOrder - b.SortOrder) * (sortOption.Mode * (currentSortOption.value.reverseSort ? -1 : 1)));
            break;
    }

    scrollerKey.value = !scrollerKey.value
    return studentList;
})

const filterCount = computed(() => {
    return Object.keys(activeFilters.value).length;
})

function clearFilters() {
    for (const key in activeFilters.value) {
        for (const val of activeFilters.value[key]) {

            if (typeof filters[key] === 'object') {
                filters[key][val] = false;
            } else {
                filters[key] = false;
            }
            
        }
    }
}

const currentSortOption = computed(() => {
    return sortOptions.find(({key}) => key === sortOption.SortKey);
})

watch(toRefs(useSettingsStore().settings).server, (newVal, oldVal) => {
    if (oldVal != newVal) {
        statCache.max = {};
        statCache.collection = {};
    }
})

</script>

<template>

<div class="d-flex gap-3">

    <div id="student-filters" class="offcanvas-md offcanvas-start">
        <div class="h-100" :class="filtersClass" >
            <div class="p-2 d-flex flex-column gap-2 h-100">
                <div v-show="useOffCanvas">
                    <div class="d-flex align-items-center p-1">
                        <h3 class="text-bold m-0">{{ translateUi('filters') }}</h3>
                        <button class="btn-close ms-auto" data-bs-dismiss="offcanvas" data-bs-target="#student-filters"></button>
                    </div>
                    
                </div>
                <div class="d-flex gap-2 p-1">
                    <input type="search"
                    class="form-control circle px-3"
                    id="ba-student-search-text"
                    autocomplete="off"
                    v-model="filters.SearchTerm"
                    :placeholder="translateUi('search')"
                    style="height:40px;">

                    <ListSort :sort-options="sortOptions" :sort-option="sortOption" />

                </div>
                <div id="ba-student-search-filters-panel" class="flex-fill p-1">
                    <div class="search-filter-group-list">
                        <div>
                            <h5>{{ translateUi('collection') }}</h5>
                            <div class="search-filter-group">
                                
                                <button v-for="(value, key) in filters.Collection"
                                    class="btn-pill"
                                    :class="{active: value}"
                                    @click="filters.Collection[key] = !filters.Collection[key]"
                                >
                                    <fa :icon="key == 'Owned' ? 'circle-check' : 'circle-xmark'" class="ms-2" />
                                    <span class="label">{{ key == 'Owned' ? translateUi('collection_owned') : translateUi('collection_notowned') }}</span>
                                </button>
                                <button
                                    class="btn-pill"
                                    :class="{active: filters.Favourite}"
                                    @click="filters.Favourite = !filters.Favourite"
                                >
                                    <fa icon="heart" class="ms-2" />
                                    <span class="label">{{ translateUi('favourites') }}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('type') }}</h5>
                            <div class="search-filter-group">
                                
                                <button v-for="(value, key) in filters.SquadType"
                                    class="btn-pill font-nexon"
                                    :class="{[`ba-col-${key == 'Main' ? 'striker' : 'special'}`]: true, 'active': value}"
                                    @click="filters.SquadType[key] = !filters.SquadType[key]"
                                >
                                    <span class="label">{{ translate('SquadType', key) }}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('role') }}</h5>
                            <div class="search-filter-group">
                                
                                <button v-for="(value, key) in filters.TacticRole"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.TacticRole[key] = !filters.TacticRole[key]"
                                >
                                    <span class="label-filter">
                                        <img class="invert-light" width="26" height="26" :src="`/images/ui/Role_${key}.png`">
                                        {{ translate('TacticRole', key) }}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('rarity_availability') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters.StarGrade"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.StarGrade[key] = !filters.StarGrade[key]"
                                >
                                    <span class="label">
                                        <fa v-for="n in parseInt(key)" icon="star" />
                                    </span>
                                </button>
                                <button v-for="(value, key) in filters.IsLimited"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.IsLimited[key] = !filters.IsLimited[key]"
                                >
                                    <span class="label">
                                        {{ translate('IsLimited', key) }}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('attacktype') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters.BulletType"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.BulletType[key] = !filters.BulletType[key]"
                                >
                                    <span class="icon-type" :class="`bg-atk-${key.toLowerCase()}`"><img :src="'/images/ui/Type_Attack_s.png'"></span>
                                    <span class="label">{{ translate('BulletType', key) }}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('defensetype') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters.ArmorType"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.ArmorType[key] = !filters.ArmorType[key]"
                                >
                                    <span class="icon-type" :class="`bg-def-${key.toLowerCase()}`"><img :src="'/images/ui/Type_Defense_s.png'"></span>
                                    <span class="label">{{ translate('ArmorType', key) }}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('position') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters.Position"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.Position[key] = !filters.Position[key]"
                                >
                                    <span class="label font-nexon">{{ key.toUpperCase() }}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('school') }}</h5>
                            <div class="search-filter-group">
                                
                                <button v-for="(value, key) in filters.School"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.School[key] = !filters.School[key]"
                                >
                                    <span class="label-filter">
                                        <img class="invert-light" width="26" height="26" :src="`/images/schoolicon/${getSchoolIconName(key)}.png`">
                                        {{ translate('School', key) }}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('weapon') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters.WeaponType"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.WeaponType[key] = !filters.WeaponType[key]"
                                >
                                    <span class="label text-italic">{{ key }}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('student_gear') }}</h5>
                            <div class="search-filter-group">
                                <template v-for="n in 3">
                                    <button v-for="(value, key) in filters[`Equipment${n}`]"
                                        class="btn-pill"
                                        :class="{'active': value}"
                                        @click="filters[`Equipment${n}`][key] = !filters[`Equipment${n}`][key]"
                                    >
                                        <span class="label-filter">
                                            <img class="invert-light" width="24" height="24" :src="`/images/ui/Icon_Inven_${key}.png`">
                                            {{ translate('ItemCategory', key) }}
                                        </span>
                                    </button>
                                </template>
                                <button class="btn-pill" :class="{'active': filters.Gear}" @click="filters.Gear = !filters.Gear">
                                    <span class="label">{{ translateUi('student_ex_gear') }}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('combat_power') }}</h5>
                            <div class="d-flex flex-column gap-1">
                                <div v-for="terrain in terrainList" class="search-filter-group">
                                    <span><img class="invert-light" :src="`/images/ui/Terrain_${terrain}.png`" width="30" height="30"></span>
                                    <template v-for="n in 6">
                                        <button class="btn-pill"
                                            :class="{'active': filters[`${terrain}BattleAdaptation`][n-1]}"
                                            @click="filters[`${terrain}BattleAdaptation`][n-1] = !filters[`${terrain}BattleAdaptation`][n-1]"
                                        >
                                        <img width="24" height="24" :src="`/images/ui/Adaptresult${n-1}.png`" style="margin-left: 2px;">    
                                            <span class="label">
                                                {{ adaptationGrade[n-1] }}
                                            </span>
                                        </button>
                                    </template>

                                </div>
                            </div>
                        </div>
                        <div>
                            <h5>{{ translateUi('misc') }}</h5>
                            <div class="search-filter-group">
                                <button v-for="(value, key) in filters.Cover"
                                    class="btn-pill"
                                    :class="{'active': value}"
                                    @click="filters.Cover[key] = !filters.Cover[key]"
                                >
                                    <span class="label">{{ translateUi(key == 'true' ? 'uses_cover' : 'doesnt_use_cover') }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex gap-2 p-1">
                    <button class="w-100 btn-pill" :class="{disabled: filterCount == 0}" @click="clearFilters()">
                        <span class="label">
                            <fa icon="filter-circle-xmark" class="me-2" />
                            {{ `Clear ${filterCount} filter(s)` }}
                        </span>
                    </button>
                    <button class="w-100 btn-pill" :class="{active: filters.ShowInfo}" @click="filters.ShowInfo = !filters.ShowInfo">
                        <span class="label">
                            <fa icon="circle-info" class="me-2" />
                            {{ translateUi('student_search_info') }}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="flex-fill">

            <div v-show="useOffCanvas" class="card-overlay p-2 mb-2" style="position: sticky; top: 72px; z-index: 50">
                <div class="d-flex gap-2 align-items-stretch">
                    <button class="btn-pill" data-bs-toggle="offcanvas" data-bs-target="#student-filters">
                        <span class="label"><fa icon="filter" class="me-2" />{{ `${translateUi('filters')}${filterCount ? ` (${filterCount})` : ''}`}}</span>
                    </button>
                    <input v-if="useOffCanvas"
                    type="search"
                    class="form-control circle px-3"
                    id="ba-student-search-text"
                    autocomplete="off"
                    v-model="filters.SearchTerm"
                    :placeholder="translateUi('search')"
                    style="height:32px;">
                    <ListSort class="ms-auto" v-if="showFloatingSortOption" :sort-options="sortOptions" :sort-option="sortOption" />
                </div>

            </div>


            <div class="mb-3" :class="{card: !useOffCanvas, 'p-2': !useOffCanvas}">
                <div id="ba-student-search-results" class="flex-fill" :class="{'p-3': !useOffCanvas, 'show-info': filters.ShowInfo}">
                    <!-- <div id="student-select-grid" class="selection-grid student align-top flex-fill" :class="{'show-info': filters.ShowInfo}">
                        <StudentListItem v-for="student in sortedStudentList" :student="student" :use-replace="false" v-show="visibleStudents.includes(student.Id)"></StudentListItem>
                    </div> -->

                    <RecycleScroller page-mode
                        class="student-list w-100"
                        :items="resultStudentList"
                        :grid-items="gridColumns"
                        :item-size="cardHeight + cardMargin"
                        :item-secondary-size="gridItemWidth"
                        v-slot="{ item }"
                        ref="studentListEl"
                        :buffer="300"
                        :key="scrollerKey"
                        key-field="Id">
                            <div class="card-wrapper">
                                <StudentListItem :student="item" :card-width="cardWidth" :card-height="cardHeight"></StudentListItem>
                            </div>

                    </RecycleScroller>

                    <p v-show="resultStudentList.length == 0" class="text-center py-2 m-0" :class="{card: useOffCanvas}">{{ translateUi('no_results') }}</p>
                </div>
            </div>

    </div>

</div>

</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.icon-type {
    border-radius: 999px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 4px;
    margin-left: 2px;
}

.icon-type img {
    width: 14px;
    height: 14px;
}

.card-wrapper {
    display: flex;
    height: 100%;
}

#student-filters {

    width: 520px;

    @include md-up {
        width: 420px;
    }

    @include lg-up {
        width: 460px;
    }

    @include xl-up {
        width: 520px;
    }
}

#ba-student-search-filters-panel {
    @include scrollable(auto);
}

</style>