<script setup>
import { watchDebounced } from '@vueuse/core';
import { computed, ref, toRef, toRefs } from 'vue';

import { useCharacterStats, useGearStats, useStudentBondStats, useWeaponStats } from "../../composables/CharacterStats";
import { getEquipmentByType, getEquipmentStats } from '../../composables/Equipment';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { getSummonById } from '../../composables/Summon';
import { terrainList, terrainTooltip } from '../../composables/TerrainHelper';
import { useArmorTypeTooltip, useBulletTypeTooltip } from '../../composables/TypeHelper';

import { useSettingsStore } from '../../stores/SettingsStore';
import { useStudentStore } from '../../stores/StudentStore';

import ItemIcon from '../common/ItemIcon.vue';
import StatsTable from '../common/StatsTable.vue';
import Tooltip from '../common/Tooltip.vue';
import InputBond from '../inputs/InputBond.vue';
import SelectEquipment from '../inputs/SelectEquipment.vue';
import StarGrade from '../inputs/StarGrade.vue';
import ToggleGear from '../inputs/ToggleGear.vue';

const props = defineProps({
    student: {
        type: Object,
        required: true
    }
});

const settings = useSettingsStore().settings;

const studentDisplay = useStudentStore().studentDisplay;
const refStudentDisplay = toRefs(studentDisplay);

const inCollection = computed(() => {
    return useStudentStore().collectionExists(props.student.Id);
})

const studentSummons = computed(() => {
    return props.student.Summons.map((summon) => {
        const summonInfo = getSummonById(summon.Id);
        const sourceSkill = props.student.Skills.find((skill) => skill.SkillType == summon.SourceSkill);
        return {summonInfo, sourceSkill};
    })
})

const studentRef = toRef(props, 'student');

const selectedSummon = ref(0);
const selectedCharacter = computed(() => {
    if (selectedSummon.value == 0) {
        return props.student;
    } else {
        const summon = studentSummons.value[selectedSummon.value - 1].summonInfo;

        if (summon.Id == 99999) {
            summon.MaxHP1 = props.student.Summons[selectedSummon.value - 1].ObstacleMaxHP1;
            summon.MaxHP100 = props.student.Summons[selectedSummon.value - 1].ObstacleMaxHP100;
        }

        return summon;
    }
});

const statsStarGrade = computed(() => {
    return selectedSummon.value == 0 ? studentDisplay.StarGrade : 1;
})

const studentStats = useCharacterStats(selectedCharacter, refStudentDisplay.Level, statsStarGrade);
const studentStatList = ['MaxHP','AttackPower','DefensePower','HealPower','AccuracyPoint','DodgePoint','CriticalPoint','CriticalChanceResistPoint','CriticalDamageRate','CriticalDamageResistRate','StabilityPoint','Range','OppressionPower','OppressionResist', 'HealEffectivenessRate','AmmoCount'];

const weaponStats = useWeaponStats(computed(() => {return props.student.Weapon}), refStudentDisplay.WeaponLevel);

const weaponBuffList = []
for (const stat in weaponStats.calculatedStats.value) {
    weaponBuffList.push({
        stat: stat,
        enabled: computed(() => {return refStudentDisplay.WeaponStarGrade.value > 0 && selectedCharacter.value.Id != 99999}),
        type: 'Base',
        amount: computed(() => {return weaponStats.calculatedStats.value[stat].total})
    });
}

studentStats.setBuff(`Student_UniqueWeapon`, weaponBuffList);

const equipment = computed(() => {
    return props.student.Equipment.map((e, i) => getEquipmentByType(e, Math.max(1, studentDisplay.Equipment[i])));
})

for (let i = 0; i < 3; i++) {
    const equipmentBuffList = computed(() => {
        const equipmentStats = getEquipmentStats(props.student.Equipment[i], studentDisplay.Equipment[i], 1);
        const equipmentBuffList = [];
        for (const stat in equipmentStats) {
            equipmentBuffList.push({
                stat: stat.split('_')[0],
                enabled: selectedCharacter.value.Id != 99999,
                type: stat.split('_')[1],
                amount: equipmentStats[stat]
            });
        }
        return equipmentBuffList;
    })

    studentStats.setBuff(`Student_Equipment${i}`, equipmentBuffList)
}

const bondStats = useStudentBondStats(computed(() => {return props.student}), refStudentDisplay.BondLevel, true)

const bondBuffList = computed(() => {
    const buffList = [];

    for (const stat in bondStats.calculatedStats.value) {
        buffList.push({
            stat: stat,
            enabled: selectedCharacter.value.Id != 99999,
            type: 'Base',
            amount: bondStats.calculatedStats.value[stat].total
        });
    }
    
    return buffList;
})

const gearStats = useGearStats(computed(() => {return props.student.Gear}), 1);

const gearBuffList = computed(() => {
    const buffList = [];

    for (const stat in gearStats.calculatedStats.value) {
        buffList.push({
            stat: stat.split('_')[0],
            enabled: computed(() => {return refStudentDisplay.Gear.value}),
            type: stat.split('_')[1],
            amount: gearStats.calculatedStats.value[stat].total
        });
    }
    
    return buffList;
})

studentStats.setBuff(`Student_BondBonus`, bondBuffList);
studentStats.setBuff(`Student_Gear`, gearBuffList);

const terrainAffinity = computed(() => {
    const affinities = {
        Street: props.student.StreetBattleAdaptation,
        Outdoor: props.student.OutdoorBattleAdaptation,
        Indoor: props.student.IndoorBattleAdaptation
    };

    if (studentDisplay.WeaponStarGrade >= 3) {
        affinities[props.student.Weapon.AdaptationType] += props.student.Weapon.AdaptationValue;
    }

    return affinities;
})

const bulletTypeTooltip = useBulletTypeTooltip(props.student.BulletType);
const armorTypeTooltip = useArmorTypeTooltip(props.student.ArmorType);
const terrainAffinityTooltip = computed(() => {

    const tooltips = {};

    for (const terrain of terrainList) {
        tooltips[terrain] = terrainTooltip(terrain, terrainAffinity.value[terrain]);
    }

    return tooltips;
})

const gearTooltip = computed(() => {
    return {
        title: props.student.Gear.Name,
        subtitle: translateUi('student_ex_gear'),
        icon: `/images/gear/icon/${props.student.Id}.webp`,
        iconClass: 'img-scale-larger',
        body: props.student.Gear.Desc
    }
})

watchDebounced(studentDisplay, () => {
    if (inCollection.value) {
        console.log('saved collection stats')
        useStudentStore().collectionUpdate(props.student.Id, ...props.student.FavorAlts);
    }
}, { debounce: 500, maxWait: 2000 })

</script>

<template>
    <div class="d-flex flex-row flex-wrap align-items-center justify-content-between mb-1 gap-1">
        <div id="ba-student-attributes" class="d-flex flex-row flex-wrap align-items-center">
            <span id="ba-student-role" class="ba-info-pill bg-theme m-0 position-relative"><img id="ba-student-role-icon" class="invert-light" :src="`/images/ui/Role_${student.TacticRole}.png`" style="height:26px;"><span class="label">{{ translate('TacticRole', student.TacticRole) }}</span></span>
            <Tooltip v-bind="bulletTypeTooltip" id="ba-student-attacktype" class="ba-info-pill m-0" :class="`bg-atk-${student.BulletType.toLowerCase()}`">
                <img src="/images/ui/Type_Attack.png"><span class="label">{{ translate('BulletType', student.BulletType) }}</span>
            </Tooltip>
            <Tooltip v-bind="armorTypeTooltip" id="ba-student-defensetype" class="ba-info-pill m-0" :class="`bg-def-${student.ArmorType.toLowerCase()}`">
                <img src="/images/ui/Type_Defense.png"><span class="label">{{ translate('ArmorType', student.ArmorType) }}</span>
            </Tooltip>
            <span id="ba-student-position" class="ba-info-pill m-0"><span class="label">{{ student.Position.toUpperCase() }}</span></span>
            <span id="ba-student-academy" class="ba-info-pill bg-theme m-0 position-relative"><img id="ba-student-academy-icon" class="invert-light" :src="`/images/schoolicon/${student.School}.png`" style="height:26px;"><span class="label">{{ translate('School', student.School) + ' / ' + translate('Club', student.Club) }}</span></span>
        </div>
        <div id="ba-student-terrain" class="terrain-group">
            <Tooltip v-for="terrain in terrainList" v-bind="terrainAffinityTooltip[terrain]" class="terrain-info ba-panel">
                <span class="terrain-icon"><img class="invert-light" :src="`/images/ui/Terrain_${terrain}.png`"></span><br>
                <img class="affinity-icon" :src="`/images/ui/Adaptresult${terrainAffinity[terrain]}.png`">
            </Tooltip>
        </div>
        <div id="ba-student-weapon" class="ba-type-weapon ba-panel d-inline-block align-text-top position-relative" :style="{backgroundImage: `url('/images/weapon/${student.WeaponImg}.webp')`}">
            <img id="ba-student-usescover-icon" class="me-1" v-if="student.Cover" src="/images/ui/Combat_Icon_Cover_Ally.png">
            <p id="ba-student-weapontype-label" class="ba-weapon-label">{{ student.WeaponType }}</p>
            <p v-if="studentDisplay.WeaponStarGrade > 0" id="ba-student-weapon-level" class="text-bold float-end">{{ 'Lv.' + studentDisplay.WeaponLevel }}</p>
        </div>
        <div id="ba-student-gear" class="flex-fill ba-panel">
            <div class="d-flex align-items-center flex-wrap justify-content-center py-1 px-2" style="min-height: 78px;">
                <ItemIcon v-for="equip in equipment" :item-type="'Equipment'" :item="equip"></ItemIcon>

                <template v-if="regionSettings.GearUnlocked">

                    <div id="ba-student-gear-separator" class="ba-panel-separator-vertical mx-2" style="height:64px;"></div>

                    <Tooltip v-if="student.Gear.Released?.[settings.server]" v-bind="gearTooltip" class="item-drop drop-shadow">
                        <img class="ba-item-icon ba-item-n mb-0" :src="`/images/gear/icon/${student.Id}.webp`" :alt="student.Gear.Name">
                    </Tooltip>

                    <div v-if="!student.Gear.Released?.[settings.server]" class="item-drop drop-shadow">
                        <img class="ba-item-icon ba-item-n mb-0" :src="`/images/gear/empty.png`" :alt="'Empty'">
                    </div>

                </template>
            </div>
        </div>
    </div>

    <div class="row g-1 mt-2">
        <div class="d-flex flex-row justify-content-between align-items-stretch gap-2">
            <div id="student-summon-list" class="summon-list dropdown-character-list" :class="{disabled: student.Summons.length == 0}">
                <button class="btn-pill" data-bs-toggle="dropdown">
                    <template v-if="selectedSummon == 0">
                        <div class="icon active-icon"><img :src="`/images/student/icon/${student.Id}.webp`" width="28" height="28"></div>
                        <span class="active-name label">{{ student.Name }}</span>
                    </template>
                    <template v-else>
                        <div class="icon active-icon">
                            <img
                                :class="`bg-atk-${student.BulletType.toLowerCase()}`"
                                :src="`/images/skill/${studentSummons[selectedSummon - 1].sourceSkill.Icon}.webp`"
                                width="28" height="28">
                        </div>
                        <span class="active-name label">{{ studentSummons[selectedSummon - 1].summonInfo.Name }}</span>
                    </template>
                    <fa v-if="studentSummons.length" icon="caret-down" class="me-2"></fa>
                </button>
                <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-start">
                    <li v-if="studentSummons.length">
                        <button class="dropdown-item dropdown-item-icon" :class="{active: selectedSummon == 0}" @click="selectedSummon = 0">
                            <div class="icon"><img :src="`/images/student/icon/${student.Id}.webp`"></div>
                            <span>{{ student.Name }}</span>
                        </button>
                    </li>
                    <li v-for="summon, index in studentSummons">
                        <button class="dropdown-item dropdown-item-icon" :class="{active: selectedSummon == index + 1}" @click="selectedSummon = index + 1">
                            <div class="icon">
                                <img :class="`bg-atk-${student.BulletType.toLowerCase()}`" :src="`/images/skill/${summon.sourceSkill.Icon}.webp`">
                            </div>
                            <span>{{ summon.summonInfo.Name }}</span>
                        </button>
                    </li>
                </ul>
            </div>
            <div class="d-flex flex-row align-items-end gap-2">

                <!-- <button v-if="student.SquadType == 'Support'" id="ba-statpreview-status-strikerbonus" class="btn-pill tooltip-button deactivated" >
                    <div class="icon" style="padding:3px"><img src="/images/ui/Special_StatBonus.png" class="invert-light" width="22" height="22" style="border-radius:0!important;"></div>
                </button> -->

            </div>
        </div>
    </div>

    <div class="row g-1 mt-1">
        <div class="col">
            <div id="ba-student-stat-table" class="student-stat-table ba-panel ba-stats mb-0">
                <StatsTable :character-stats="studentStats" :stat-list="studentStatList" :level="studentDisplay.Level" :enable-derived-tooltip="true" :hide-ammo-count="student.SquadType == 'Support'"></StatsTable>
            </div>
        </div>
    </div>

    <div class="row g-1 mt-2">
        <div class="d-flex flex-row align-items-center">
            <input v-model.number="studentDisplay.Level" type="range" class="statpreview-level form-range me-2 flex-fill" :min="1" :max="regionSettings.AccountMaxLevel">
            <span id="ba-statpreview-level" class="ba-slider-label statpreview-level-label">{{ 'Lv.' + studentDisplay.Level }}</span>
        </div>
    </div>

    <div class="row g-1 mt-2">
        <div class="d-flex flex-row flex-wrap align-items-stretch gap-2 mb-1">
            <div class="d-flex flex-row align-items-stretch">
                <StarGrade v-model:star-grade="studentDisplay.StarGrade" v-model:weapon-star-grade="studentDisplay.WeaponStarGrade" v-model:weapon-level="studentDisplay.WeaponLevel"></StarGrade>
            </div>
            <div class="flex-fill"></div>

            <div class="d-flex flex-row align-items-stretch gap-2">
                <SelectEquipment v-for="n in 3" :equipment-type="student.Equipment[n - 1]" v-model:equipment-tier="studentDisplay.Equipment[n - 1]"></SelectEquipment>
                <ToggleGear v-if="student.Gear.Released?.[settings.server]" v-model:include-gear="studentDisplay.Gear" :student="student" />
            </div>
        </div>
        <div class="d-flex flex-row flex-wrap align-items-stretch gap-2 mb-1">
            <InputBond :student-id="student.Id" v-model:bond-level="studentDisplay.BondLevel[0]"></InputBond>
            <InputBond v-for="(alt, index) in student.FavorAlts" :student-id="alt" v-model:bond-level="studentDisplay.BondLevel[index + 1]"></InputBond>
            <!-- <button id="ba-statpreview-status-passive-level" onclick="togglePassiveSkill()" class="btn-pill tooltip-button">
                <div class="icon statpreview-passive bg-skill"><img id="ba-statpreview-status-passive-icon" src="" width="28" height="28"></div>
                <span class="label"></span>
            </button>

            <button id="ba-statpreview-status-buffs" onclick="toggleBuffs()" class="btn-pill tooltip-button">
                <span class="label">
                    <i class="fa-regular fa-square off"></i>
                    <i class="fa-solid fa-square-check on"></i>
                    <span class="ps-2" data-localize-id="ui,buffs"></span>
                    <span class="ps-1" id="ba-statpreview-status-buffs-count"></span>
                </span>
            </button>
            <div class="flex-fill"></div>
            <div id="ba-statpreview-active-buffs" class="active-buffs px-2 ba-panel"></div> -->
        </div>
    </div>
</template>