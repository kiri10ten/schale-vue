<script setup>
import { watchDebounced } from '@vueuse/core';
import { computed, ref, toRef, toRefs, toValue } from 'vue';

import { useCharacterStats, useGearStats, useWeaponStats } from "../../composables/CharacterStats";
import { useStudentBondStats } from '../../composables/Bond';
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
import Modal from '../common/Modal.vue';
import StatsTableFull from '../common/StatsTableFull.vue';
import { getBuffIconNameFromStat, statToBuffIcon } from '../../composables/Buffs';
import { upgradeSkillTypes, usePersonalSkills } from '../../composables/Skills';
import CalculationBuffs from '../../calculation/CalculationBuffs.vue';
import BuffTag from './skills/BuffTag.vue';
import { cloneDeep } from 'lodash';
import { getSchoolIconName } from '../../composables/Icon';
import SelectGear from '../inputs/SelectGear.vue';

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
        const sourceSkill = props.student.Skills[summon.SourceSkill];
        return {summonInfo, sourceSkill};
    })
})

const summonSkill = computed(() => {
    if (selectedSummon.value > 0) {
        const skill = cloneDeep(props.student.Skills[props.student.Summons[selectedSummon.value - 1].SourceSkill]);
        skill.Type = props.student.Summons[selectedSummon.value - 1].SourceSkill;
        skill.InheritCasterStat = props.student.Summons[selectedSummon.value - 1].InheritCasterStat;
        skill.InheritCasterAmount = props.student.Summons[selectedSummon.value - 1].InheritCasterAmount;

        return skill;
    } else return null;    
})

const selectedSummon = ref(0);

const summon = computed(() => {
    return selectedSummon.value > 0 ? getSummonById(selectedCharacter.value.Id) : null;
})

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

const selectedCharacterStats = computed(() => {
    if (selectedSummon.value == 0) {
        return studentStats;
    } else {
        return summonStats.value;
    }
})

const studentStats = useCharacterStats(props.student, refStudentDisplay.Level, refStudentDisplay.StarGrade);

const studentStatList = ['MaxHP','AttackPower','DefensePower','HealPower','AccuracyPoint','DodgePoint','CriticalPoint','CriticalChanceResistPoint','CriticalDamageRate','CriticalDamageResistRate','StabilityPoint','Range','OppressionPower','OppressionResist', 'HealEffectivenessRate','AmmoCount'];
const studentStatListFull = ['MaxHP','AttackPower','DefensePower','HealPower','AccuracyPoint','DodgePoint','CriticalPoint','CriticalChanceResistPoint','CriticalDamageRate','CriticalDamageResistRate','StabilityPoint','Range','OppressionPower','OppressionResist','HealEffectivenessRate','RegenCost','AttackSpeed','MoveSpeed','BlockRate','DefensePenetration','AmmoCount','DamageRatio','DamagedRatio','EnhanceExplosionRate','EnhancePierceRate','EnhanceMysticRate','EnhanceSonicRate','ExtendBuffDuration','ExtendDebuffDuration','ExtendCrowdControlDuration'];

const weaponStats = useWeaponStats(computed(() => {return props.student.Weapon}), refStudentDisplay.WeaponLevel);

const weaponBuffList = []
for (const stat in weaponStats.calculatedStats.value) {
    weaponBuffList.push({
        label: translateUi('student_weapon'),
        stat: stat,
        enabled: computed(() => {return refStudentDisplay.WeaponStarGrade.value > 0 && selectedCharacter.value.Id != 99999}),
        type: 'Base',
        amount: computed(() => {return weaponStats.calculatedStats.value[stat].total})
    });
}

studentStats.setBuff(`Student_UniqueWeapon`, weaponBuffList);

const bondStats = useStudentBondStats(computed(() => {return props.student}), refStudentDisplay.BondLevel, true)

const bondBuffList = computed(() => {
    const buffList = [];

    for (const stat in bondStats.calculatedStats.value) {
        buffList.push({
            label: translateUi('student_bond'),
            stat: stat,
            enabled: true,
            type: 'Base',
            amount: bondStats.calculatedStats.value[stat].total
        });
    }
    
    return buffList;
})

studentStats.setBuff(`Student_BondBonus`, bondBuffList);

const equipment = computed(() => {
    return props.student.Equipment.map((e, i) => getEquipmentByType(e, Math.max(1, studentDisplay.Equipment[i])));
})

const equipmentsBuffList = [];

for (let i = 0; i < 3; i++) {
    const equipmentBuffList = computed(() => {
        const equipment = getEquipmentByType(props.student.Equipment[i], studentDisplay.Equipment[i]);
        const equipmentStats = getEquipmentStats(props.student.Equipment[i], studentDisplay.Equipment[i], -1);
        const equipmentBuffList = [];
        for (const stat in equipmentStats) {
            equipmentBuffList.push({
                label: equipment.Name,
                stat: stat.split('_')[0],
                enabled: true,
                type: stat.split('_')[1],
                amount: equipmentStats[stat]
            });
        }
        return equipmentBuffList;
    })

    equipmentsBuffList.push(equipmentBuffList)

    studentStats.setBuff(`Student_Equipment${i}`, equipmentBuffList)
}

const gearStats = useGearStats(computed(() => {return props.student.Gear}), 1);

const gearBuffList = computed(() => {
    const buffList = [];

    for (const stat in gearStats.calculatedStats.value) {
        buffList.push({
            label: props.student.Gear.Name,
            stat: stat.split('_')[0],
            enabled: computed(() => {return refStudentDisplay.Gear.value}),
            type: stat.split('_')[1],
            amount: gearStats.calculatedStats.value[stat].total
        });
    }
    
    return buffList;
})

studentStats.setBuff(`Student_Gear`, gearBuffList);

const summonBuffList = computed(() => {

    const buffList = [];

    if (selectedSummon.value > 0) {

        const summon = props.student.Summons[selectedSummon.value - 1]
        const skillLevel = toValue(refStudentDisplay.Skill.value[summon.SourceSkill].Level);

        if (skillLevel > 0) {

            for (let i = 0; i < summon.InheritCasterStat.length; i++) {
                const amount = Math.round(studentStats.calculatedStats.value[summon.InheritCasterStat[i]].total * (summon.InheritCasterAmount[i][skillLevel - 1] / 10000));

                buffList.push({
                    label: props.student.Skills[summon.SourceSkill].Name,
                    stat: summon.InheritCasterStat[i],
                    enabled: true,
                    type: 'Base',
                    amount: amount,
                    icon: (amount < 0 ? 'Debuff' : 'Buff') + '_' + (statToBuffIcon[summon.InheritCasterStat[i]] ?? summon.InheritCasterStat[i]),
                });
            }

        }
    }

    return buffList;
})

const summonStats = computed(() => {
    if (selectedSummon.value > 0) {
        const summonStats = useCharacterStats(selectedCharacter, refStudentDisplay.Level, 1);

        if (selectedCharacter.value.Id != 99999) {
            summonStats.setBuff(`Student_UniqueWeapon`, weaponBuffList);
            summonStats.setBuff(`Student_Gear`, gearBuffList);

            equipmentsBuffList.forEach((list, i) => {
                summonStats.setBuff(`Student_Equipment${i}`, list)
            });
        }

        summonStats.setBuff(`Summon_Inheritance`, summonBuffList);

        return summonStats;

    } else return null;
})

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

const personalSkills = usePersonalSkills(props.student, refStudentDisplay.WeaponStarGrade, refStudentDisplay.Gear)

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
            <Tooltip v-bind="bulletTypeTooltip" id="ba-student-attacktype" class="ba-info-pill bg-theme ps-0 m-0">
                <div class="icon-type" :class="`bg-atk-${student.BulletType.toLowerCase()}`"><img src="/images/ui/Type_Attack.png"></div><span class="label">{{ translate('BulletType', student.BulletType) }}</span>
            </Tooltip>
            <Tooltip v-bind="armorTypeTooltip" id="ba-student-defensetype" class="ba-info-pill bg-theme ps-0 m-0">
                <div class="icon-type" :class="`bg-def-${student.ArmorType.toLowerCase()}`"><img src="/images/ui/Type_Defense.png"></div><span class="label">{{ translate('ArmorType', student.ArmorType) }}</span>
            </Tooltip>
            <!-- <span id="ba-student-position" class="ba-info-pill m-0"><span class="label">{{ student.Position.toUpperCase() }}</span></span> -->
            <span id="ba-student-academy" class="ba-info-pill bg-theme m-0 position-relative"><img id="ba-student-academy-icon" class="invert-light" :src="`/images/schoolicon/${getSchoolIconName(student.School)}.png`" style="height:26px;"><span class="label">{{ translate('School', student.School) + ' / ' + translate('Club', student.Club) }}</span></span>
        </div>
        <div id="ba-student-terrain" class="terrain-group">
            <Tooltip v-for="terrain in terrainList" v-bind="terrainAffinityTooltip[terrain]" class="terrain-info ba-panel">
                <span class="terrain-icon"><img class="invert-light" :src="`/images/ui/Terrain_${terrain}.png`"></span><br>
                <img class="affinity-icon" :src="`/images/ui/Adaptresult${terrainAffinity[terrain]}.png`">
            </Tooltip>
        </div>
        <div id="ba-student-weapon" class="ba-type-weapon ba-panel d-flex align-text-top position-relative" :style="{backgroundImage: `url('/images/weapon/${student.WeaponImg}.webp')`}">
            <img id="ba-student-usescover-icon" class="me-1" v-if="student.Cover" src="/images/ui/Combat_Icon_Cover_Ally.png">
            <p id="ba-student-weapontype-label" class="text-bold text-italic font-nexon">{{ student.WeaponType }} / {{student.Position.toUpperCase()}}</p>
            <!-- <p v-if="studentDisplay.WeaponStarGrade > 0" id="ba-student-weapon-level" class="text-bold ms-auto">{{ 'Lv.' + studentDisplay.WeaponLevel }}</p> -->
        </div>
        <div id="ba-student-gear" class="flex-fill ba-panel">
            <div class="d-flex align-items-center flex-wrap justify-content-center py-1 px-2" style="min-height: 78px;">
                <ItemIcon v-for="equip in equipment" :item-type="'Equipment'" :item="equip"></ItemIcon>

                <template v-if="regionSettings.GearUnlocked">

                    <div id="ba-student-gear-separator" class="ba-panel-separator-vertical mx-2" style="height:64px;"></div>

                    <a v-if="student.Gear.Released?.[settings.server]" class="gear-link" href="" @click.prevent="studentDisplay.ActiveTab = 'gear'">
                        <Tooltip v-bind="gearTooltip" class="item-drop">
                            <img class="ba-item-icon ba-item-n mb-0" :src="`/images/gear/icon/${student.Id}.webp`" :alt="student.Gear.Name">
                        </Tooltip>
                    </a>

                    <div v-if="!student.Gear.Released?.[settings.server]" class="item-drop">
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
                <Modal fixed-height class="btn-pill">
                    <template #trigger>
                        <span class="label">
                            <fa icon="magnifying-glass" class="me-2" />
                            {{ translateUi('details') }}
                        </span>
                    </template>
                    <template #title>
                        <fa icon="search" class="me-2"/>Detailed Character Stats
                    </template>
                    <template #body>
                        <div class="student-stat-table ba-panel ba-stats striped mb-0">
                            <StatsTableFull :character-stats="selectedCharacterStats" :stat-list="studentStatListFull" :is-special="selectedCharacter.SquadType == 'Support'"></StatsTableFull>
                        </div>
                    </template>
                </Modal>

                <!-- <button v-if="student.SquadType == 'Support'" id="ba-statpreview-status-strikerbonus" class="btn-pill tooltip-button deactivated" >
                    <div class="icon" style="padding:3px"><img src="/images/ui/Special_StatBonus.png" class="invert-light" width="22" height="22" style="border-radius:0!important;"></div>
                </button> -->

            </div>
        </div>
    </div>

    <div class="row g-1 mt-1">
        <div class="col">
            <div id="ba-student-stat-table" class="student-stat-table ba-panel ba-stats mb-0">
                <StatsTable :character-stats="selectedCharacterStats" :stat-list="studentStatList" :enable-derived-tooltip="true" :hide-ammo-count="selectedCharacter.SquadType == 'Support'"></StatsTable>
                <div class="px-2"><div class="ba-panel-separator"></div></div>
                <div class="d-flex p-2 gap-2">
                    <Modal keep-alive fixed-height class="btn-pill">
                        <template #title>
                            <fa icon="circle-arrow-up" class="me-2" />Configure Buffs
                            <!-- <Modal no-backdrop class="btn-pill">
                                <template #title><fa icon="question" class="me-2" />Help</template>
                                <template #trigger>
                                    <span class="label">
                                        <fa icon="question" class="" />
                                    </span>
                                </template>
                                <template #body>
                                    <p>Use this menu to add stat-increasing buffs and debuffs to the selected character.</p>
                                    <ul>
                                        <li>Toggle buffs on and off with <fa icon="square-check" /></li>
                                        <li>Students' own buffs are visible under <b>Personal Buffs</b></li>
                                    </ul>
                                    <p>Add allied students' or enemies' buff/debuffing skills under <b>Other Buffs</b></p>
                                    <ul>
                                        <li>Click <fa icon="trash" /> to remove a skill or <fa icon="thumbtack" /> to pin it to the top of the search results</li>
                                        <li><fa icon="warning" /> will appear if you have buffs set that cannot stack with each other</li>
                                        <li>As a general rule, buffs that affect the same stat and originate from the same skill slot (EX, Basic etc.) will overwrite each other</li>
                                    </ul>
                                    <p>If the buff/debuff you want to add isn't available, you can use <fa icon="wrench" /> to define a buff/debuff yourself</p>
                                    <ul>
                                        <li>Click <b>+/-</b> to change between adding a positive (buff) or negative (debuff) value</li>
                                        <li>Click <b>%</b> to change between adding a flat buff and a percentage buff</li>
                                        <li>Stats are usually calculated using the formula (Base Value + Flat Buffs) &times; Percentage Buffs</li>
                                    </ul>
                                </template>
                            </Modal> -->
                        </template>
                        <template #trigger>
                            <span class="label">
                                <fa icon="circle-arrow-up" class="me-2" />
                                {{ translateUi('buffs') }}
                            </span>
                        </template>
                        <template #body>

                            <template v-if="selectedSummon > 0">
                                <h5>Summon Skill Buff</h5>
                                <div class="d-flex flex-column gap-2 mb-3">
                                    <div class="ba-panel p-2">
                                        <div class="d-flex gap-3 align-items-start">
                                            <div class="skill-icon bg-skill small" :class="student.BulletType.toLowerCase()">
                                                <img :src="`/images/skill/${summonSkill.Icon}.webp`">
                                                <fa v-if="upgradeSkillTypes.includes(summonSkill.Type)" icon="plus" class="plus-icon" />
                                            </div>
                                            <div class="flex-fill">
                                                <div class="d-flex gap-3 w-100">
                                                    <h5 class="mb-1">{{ summonSkill.Name }}</h5>
                                                    <span class="text-italic ms-auto no-wrap">{{ translate('SkillType', summonSkill.Type) }}</span>
                                                </div>
                                                
                                                <p class="m-0">
                                                    <template v-for="n in summonSkill.InheritCasterStat.length">
                                                        <br v-if="n > 1" />
                                                        <span class="me-1">
                                                            Inherits <b>{{ +(summonSkill.InheritCasterAmount[n - 1][studentDisplay.Skill[summonSkill.Type].Level - 1] / 100).toFixed(2) }}%</b> of {{ props.student.Name }}'s 
                                                        </span>
                                                        <BuffTag :name="'Buff_' + getBuffIconNameFromStat(summonSkill.InheritCasterStat[n - 1])" ></BuffTag>
                                                    </template>
                                                </p>

                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="range" class="form-range flex-fill" v-model.number="studentDisplay.Skill[summonSkill.Type].Level" min="1" :max="summonSkill.Type == 'Ex' ? 5 : 10">
                                        <span class="ba-slider-label">
                                            <img v-if="studentDisplay.Skill[summonSkill.Type].Level == (summonSkill.Type == 'Ex' ? 5 : 10)" :src="'/images/ui/ImageFont_Max.png'">
                                            <template v-else>{{ `Lv.${studentDisplay.Skill[summonSkill.Type].Level}` }}</template>
                                        </span>
                                    </div>
                                </div>
                            </template>

                            <CalculationBuffs
                                :character="student"
                                :character-stats="studentStats"
                                :summon="summon"
                                :summon-stats="summonStats"
                                :personal-skills="personalSkills"
                                :character-display="studentDisplay"
                            />
                        </template>
                    </Modal>
                    <div class="active-buffs ms-auto">
                        <div v-for="(value, key) in selectedCharacterStats.activeIcons.value" class="active-buff">
                            <img :src="`/images/buff/${key}.webp`" width="22" height="26">
                            <span v-if="value > 1" class="stack-count">
                                {{ value }}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <div class="row g-1 mt-2">
        <div class="d-flex flex-row align-items-center">
            <input v-model.number="studentDisplay.Level" type="range" class="statpreview-level form-range me-2 flex-fill" :min="1" :max="regionSettings.AccountMaxLevel">
            <span id="ba-statpreview-level" class="ba-slider-label statpreview-level-label">{{ 'Lv.' + studentDisplay.Level }}</span>
            <fa v-if="useStudentStore().collectionLocked(student.Id)" icon="lock" class="ms-2 text-muted"></fa>
        </div>
    </div>

    <div class="row g-1 mt-2">
        <div class="d-flex flex-row flex-wrap align-items-stretch gap-2 mb-1">
            <div class="d-flex flex-row align-items-stretch">
                <StarGrade v-model:star-grade="studentDisplay.StarGrade" v-model:weapon-star-grade="studentDisplay.WeaponStarGrade" v-model:weapon-level="studentDisplay.WeaponLevel"></StarGrade>
            </div>
            <div class="flex-fill"></div>
            <InputBond :student-id="student.Id" v-model:bond-level="studentDisplay.BondLevel[0]"></InputBond>
            <InputBond v-for="(alt, index) in student.FavorAlts" :student-id="alt" v-model:bond-level="studentDisplay.BondLevel[index + 1]"></InputBond>
        </div>
        <div class="d-flex flex-row flex-wrap align-items-stretch gap-2 mb-1">
            <div class="d-flex flex-row align-items-stretch gap-2">
                <SelectEquipment v-for="n in 3" :equipment-type="student.Equipment[n - 1]" v-model:equipment-tier="studentDisplay.Equipment[n - 1]"></SelectEquipment>
                <SelectGear v-if="student.Gear.Released?.[settings.server]" v-model:gear-tier="studentDisplay.Gear" :student="student" />
            </div>
        </div>
    </div>

    

</template>

<style scoped lang="scss">

.icon-type {
    border-radius: 999px !important;

    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 4px;
    margin-left: 4px;

    img {
        width: 14px;
        height: 14px;
    }
}

</style>