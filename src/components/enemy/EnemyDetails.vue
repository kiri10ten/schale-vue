<script setup>
import { computed, toRefs } from 'vue';
import StatsTable from '../common/StatsTable.vue';
import { translate, translateUi } from '../../composables/Localization';
import { useArmorTypeTooltip, useBulletTypeTooltip } from '../../composables/TypeHelper';
import Tooltip from '../common/Tooltip.vue';
import { useCharacterStats } from '../../composables/CharacterStats';
import { useSettingsStore } from '../../stores/SettingsStore';
import SkillText from '../student/skills/SkillText.vue';

const props = defineProps({
    enemy: {
        type: Object,
        required: true
    },
    level: Number,
    grade: {
        type: Number,
        default: 1
    },
    bonuses: {
        type: Array,
        default: []
    },
})

const statList = ['MaxHP','AttackPower','DefensePower','HealPower','AccuracyPoint','DodgePoint','CriticalPoint','CriticalChanceResistPoint','CriticalDamageRate','CriticalDamageResistRate','StabilityPoint','Range','DefensePenetration','DamagedRatio','OppressionPower','OppressionResist']

const {enemy, level, grade} = toRefs(props);
const enemyStats = useCharacterStats(enemy, level, grade);

const settings = useSettingsStore().settings;

const enemyBuffList = computed(() => {

    const buffList = [];

    for (const bonus of props.bonuses) {

        const [buffStat, buffType] = bonus.Stat.split('_')

        if (!bonus.LabelStacks) {

            buffList.push({
                label: translate('Stat', buffStat),
                stat: buffStat,
                enabled: true,
                type: buffType,
                amount: bonus.Amount
            });

        }
    }

    return buffList;

})

enemyStats.setBuff(`Enemy_Bonuses`, enemyBuffList);

const enemyGroggy = computed(() => {
    if (props.enemy.GroggyGauge) {
        return {
            GroggyGauge: props.enemy.GroggyGauge.toLocaleString(),
            GroggyTime: translateUi('time_seconds', (props.enemy.GroggyTime / 1000).toLocaleString()) 
        };
    } else {
        return null;
    }
})

const bulletTypeTooltip = useBulletTypeTooltip(computed(() => props.enemy.BulletType));
const armorTypeTooltip = useArmorTypeTooltip(computed(() => props.enemy.ArmorType));

</script>

<template>

    <div class="ba-panel">
        <div class="enemy-attributes p-2">
            <div class="d-flex gap-3">
                <div class="enemy-select-icon large" :class="enemy.Rank.toLowerCase()">
                    <div class="icon-enemy">
                        <img v-if="enemy.Icon" :src="`/images/enemy/${enemy.Icon}.webp`">
                    </div>
                </div>
                <div class="flex-fill d-flex flex-column gap-1">
                    <h3 id="ba-stage-enemy-name" class="title-text mb-0">{{ enemy.Name }}</h3>
                    <div class="d-flex gap-1 flex-wrap">
                        <span id="ba-stage-enemy-class" class="ba-info-pill-s" :class="`ba-class-${enemy.SquadType.toLowerCase()}`">
                            <span class="label font-nexon">{{ translate('SquadType', enemy.SquadType) }}</span>
                        </span>
                        <span class="ba-info-pill-s bg-theme text-bold">
                            <span class="label">Lv.{{ level }}<template v-if="grade > 1"> ★{{ grade }}</template></span>
                        </span>
                        <Tooltip v-bind="bulletTypeTooltip" class="ba-info-pill-s bg-theme text-bold">
                            <span class="icon-type" :class="`bg-atk-${enemy.BulletType.toLowerCase()}`"><img src="/images/ui/Type_Attack_s.png"></span>
                            <span class="label">{{ translate('BulletType', enemy.BulletType) }}</span>
                        </Tooltip>
                        <Tooltip v-bind="armorTypeTooltip" class="ba-info-pill-s bg-theme text-bold">
                            <span class="icon-type" :class="`bg-def-${enemy.ArmorType.toLowerCase()}`"><img src="/images/ui/Type_Defense_s.png"></span>
                            <span class="label">{{ translate('ArmorType', enemy.ArmorType) }}</span>
                        </Tooltip>
                        <span v-if="enemy.Size" class="ba-info-pill-s bg-theme text-bold">
                            <span class="label">
                                {{ translate('CharacterSize', enemy.Size) }}
                            </span>
                        </span>
                        <!-- <span id="ba-stage-enemy-terrain" class="ba-info-pill-s bg-theme text-bold"><span class="icon-terrain-strength"><img width="20" height="20"></span><span class="label"></span></span> -->
                        <div v-if="settings.showDeveloperProps" class="ba-info-pill-s bg-theme px-2 text-muted align-self-top">
                            {{ enemy.Id }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="ba-stats">
            <StatsTable :character-stats="enemyStats" :stat-list="statList" :groggy-info="enemyGroggy" enable-derived-tooltip />
        </div>
        <template v-if="enemy.Skills">
            <div class="p-2">
                <div class="ba-panel-separator mb-2"></div>
                <ul class="mb-1">
                    <li v-for="skill in enemy.Skills" :key="skill">
                        <SkillText class="mb-0" :skill="{Desc: skill, Parameters: []}" :skill-level="1" />
                    </li>
                </ul>
            </div>
        </template>
    </div>

</template>