import { clamp } from "lodash";
import { computed, reactive, ref, toValue } from "vue";

const damageResistanceStats = ['DamagedRatio', 'EnhanceLightArmorRate', 'EnhanceHeavyArmorRate', 'EnhanceUnarmedRate', 'EnhanceElasticArmorRate'];
const specialBonusStats = ['MaxHP', 'AttackPower', 'HealPower', 'DefensePower'];
const specialBonusFactor = {'MaxHP': 0.1, 'AttackPower': 0.1, 'HealPower': 0.05, 'DefensePower': 0.05};
export const allModifiableStats = [
    'MaxHP',
    'AttackPower',
    'HealPower',
    'DefensePower',
    'AccuracyPoint',
    'DodgePoint',
    'CriticalPoint',
    'CriticalDamageRate',
    'CriticalChanceResistPoint',
    'CriticalDamageResistRate',
    'StabilityPoint',
    'StabilityRate',
    'AmmoCount',
    'Range',
    'RegenCost',
    'DamageRatio',
    'DamagedRatio',
    'HealEffectivenessRate',
    'OppressionPower',
    'OppressionResist',
    'AttackSpeed',
    'BlockRate',
    'DefensePenetration',
    'MoveSpeed',
    'EnhanceExplosionRate',
    'EnhancePierceRate',
    'EnhanceMysticRate',
    'EnhanceSonicRate',
    'ExtendBuffDuration',
    'ExtendDebuffDuration',
    'ExtendCrowdControlDuration',
]

export function useCharacterStats(charRef, level, starGrade) {

    const char = toValue(charRef);

    const stats = computed(() => {
        const char = toValue(charRef);
        return {
            MaxHP: [char.MaxHP1, char.MaxHP100],
            AttackPower: [char.AttackPower1, char.AttackPower100],
            HealPower: [char.HealPower1, char.HealPower100],
            DefensePower: [char.DefensePower1, char.DefensePower100],
            AccuracyPoint: char.AccuracyPoint,
            DodgePoint: char.DodgePoint,
            CriticalPoint: char.CriticalPoint,
            CriticalDamageRate: char.CriticalDamageRate,
            CriticalChanceResistPoint: char.CriticalChanceResistPoint ?? 100,
            CriticalDamageResistRate: char.CriticalDamageResistRate ?? 5000,
            StabilityPoint: char.StabilityPoint,
            StabilityRate: char.StabilityRate ?? 2000,
            AmmoCount: char.AmmoCount ?? 0,
            AmmoCost: char.AmmoCost ?? 0,
            Range: char.Range ?? 0,
            RegenCost: char.RegenCost ?? 700,
            DamageRatio: char.DamageRatio ?? 10000,
            DamagedRatio: char.DamagedRatio ?? 10000,
            HealEffectivenessRate: char.HealEffectivenessRate ?? 10000,
            OppressionPower: char.OppressionPower ?? 100,
            OppressionResist: char.OppressionResist ?? 100,
            AttackSpeed: char.AttackSpeed ?? 10000,
            BlockRate: char.BlockRate ?? 0,
            DefensePenetration: [char.DefensePenetration1 ?? 0, char.DefensePenetration100 ?? 0],
            MoveSpeed: char.MoveSpeed ?? 200,
            EnhanceExplosionRate: char.EnhanceExplosionRate ?? 10000,
            EnhancePierceRate: char.EnhancePierceRate ?? 10000,
            EnhanceMysticRate: char.EnhanceMysticRate ?? 10000,
            EnhanceSonicRate: char.EnhanceSonicRate ?? 10000,
            ExtendBuffDuration: char.ExtendBuffDuration ?? 10000,
            ExtendDebuffDuration: char.ExtendDebuffDuration ?? 10000,
            ExtendCrowdControlDuration: char.ExtendCrowdControlDuration ?? 10000,
            EnhanceLightArmorRate: char.EnhanceLightArmorRate ?? 10000,
            EnhanceHeavyArmorRate: char.EnhanceHeavyArmorRate ?? 10000,
            EnhanceUnarmedRate: char.EnhanceUnarmedRate ?? 10000,
            EnhanceElasticArmorRate: char.EnhanceElasticArmorRate ?? 10000,
        }
    });

    const growthType = ref(char.StatLevelUpType ?? 'Standard');
    const transcendence = computed(() => {return {
        AttackPower: char.Transcendence?.[0] ?? [0, 1000, 1200, 1400, 1700],
        MaxHP: char.Transcendence?.[1] ?? [0, 500, 700, 900, 1400],
        HealPower: char.Transcendence?.[2] ?? [0, 750, 1000, 1200, 1500],
    }});

    const buffs = reactive({});

    function setBuff(id, buffList) {
        buffs[id] = buffList;
        // {
        //     enabled: enabled,
        //     stat: stat,
        //     type: type,
        //     amount: amount
        // }
    }

    function removeBuff(id) {
        delete buffs[id];
    }

    function calculate(stat) {

        let base = stats.value[stat];

        if (Array.isArray(base)) {
            base = interpolateStat(base, toValue(level), 1 + ((transcendence.value[stat]?.slice(0, toValue(starGrade)).reduce((pv, cv) => pv + cv, 0) ?? 0) / 10000), growthType);
        }

        const bonuses = {
            Base: 0,
            Coefficient: 1,
            BaseOuter: 0,
            BonusList: []
        }

        const specialBonuses = {
            Base: 0,
            Coefficient: 1,
            BaseOuter: 0
        }

        const uniqueKeys = [];
        const conflicts = {};

        for (const id of Object.keys(buffs).reverse()) {

            for (let i = 0; i < buffs[id].length; i++) {
                const buff = buffs[id][i];

                if (buff.stat == stat && toValue(buff.enabled)) {
    
                    if (buff.conflictKey) {
                        if (uniqueKeys.includes(buff.conflictKey)) {

                            console.log('Buff conflict', buff.conflictKey)

                            if (conflicts[buff.conflictKey]) {
                                conflicts[buff.conflictKey].push(id);
                            } else {
                                conflicts[buff.conflictKey] = [id];
                            }

                            continue;

                        } else {
                            uniqueKeys.push(buff.conflictKey);
                        }
                    }

                    let amount = 0;

                    if (buff.type == 'Coefficient') {
                        amount += toValue(buff.amount) / 10000;
                    } else {
                        amount += toValue(buff.amount);
                    }

                    bonuses[buff.type] += amount;

                    if (!buff.icon) {
                        specialBonuses[buff.type] += amount
                    }

                    bonuses.BonusList.unshift({
                        Name: buff.label,
                        Type: buff.type,
                        Amount: buff.amount
                    })
                    
                }

            }

        }

        let applyBuffCap = true
        let allowNegative = false

        if (stat == "DamagedRatio") {
            applyBuffCap = false
            allowNegative = true
        }

        if (applyBuffCap) {
            bonuses.Coefficient = Math.max(bonuses.Coefficient, 0.2);
        }

        const total = Math.round(((base + bonuses.Base) * bonuses.Coefficient).toFixed(4)) + bonuses.BaseOuter;

        let baseStr;
        let totalStr;

        if (damageResistanceStats.includes(stat)) {
            totalStr = (+((total - 10000) / 100).toFixed(2)).toLocaleString() + "%";
            baseStr = (+((base - 10000) / 100).toFixed(2)).toLocaleString() + "%";
        } else if (isRateStat(stat)) {
            totalStr = (+(total/100).toFixed(2)).toLocaleString() + "%"
            baseStr = (+(base/100).toFixed(2)).toLocaleString() + "%"
        } else {
            totalStr = total.toLocaleString()
            baseStr = base.toLocaleString()
        }

        const returnStats = { base, baseStr, bonuses, conflicts, total: allowNegative ? total : Math.max(total, 0), totalStr };

        if (specialBonusStats.includes(stat)) {
            const spTotal = Math.round(((base + specialBonuses.Base) * specialBonuses.Coefficient).toFixed(4)) + specialBonuses.BaseOuter;
            const spBonus = Math.floor(spTotal * specialBonusFactor[stat]);

            returnStats['special'] = spBonus;
            returnStats['specialStr'] = '+' + spBonus.toLocaleString();
        }

        return returnStats;
    }

    const calculatedStats = computed(() => {

        const calculated = {};

        for (const stat in stats.value) {
            calculated[stat] = calculate(stat);
        }

        return calculated;
        
    })

    const activeIcons = computed(() => {

        const uniqueKeys = [];
        const activeIcons = {};

        for (const id in buffs) {

            for (let i = 0; i < buffs[id].length; i++) {
                const buff = buffs[id][i];

                if (buff.icon && buff.enabled) {
    
                    if (buff.conflictKey) {
                        if (uniqueKeys.includes(buff.conflictKey)) {
                            continue;
                        } else {
                            uniqueKeys.push(buff.conflictKey);
                        }
                    }

                    if (activeIcons[buff.icon]) {
                        activeIcons[buff.icon] += buff.stacks ?? 1
                    } else {
                        activeIcons[buff.icon] = buff.stacks ?? 1
                    }

                }
            }
        }

        return activeIcons;
    })

    return {level, starGrade, buffs, setBuff, removeBuff, calculate, calculatedStats, activeIcons}
}

export function isRateStat(stat) {
    return (stat == 'AttackSpeed' || stat.endsWith('Ratio') || stat.endsWith('Rate') || stat.startsWith('Extend'))
}

export function useWeaponStats(weapon, level) {

    const stats = computed(() => {
        const weaponVal = toValue(weapon)
        return {
            MaxHP: [weaponVal.MaxHP1, weaponVal.MaxHP100],
            AttackPower: [weaponVal.AttackPower1, weaponVal.AttackPower100],
            HealPower: [weaponVal.HealPower1, weaponVal.HealPower100],
        }
    })

    const growthType = computed(() => {return toValue(weapon).StatLevelUpType});

    const calculatedStats = computed(() => {
        const calculated = {};

        for (const stat in stats.value) {
            const total = interpolateStat(stats.value[stat], toValue(level), 1, growthType)
            calculated[stat] = {total: total, totalStr: '+'+total.toLocaleString()}
        }

        return calculated;
        
    })

    return {stats, level, calculatedStats}
}

export function useGearStats(gear, tier) {
    const calculatedStats = computed(() => {

        const gearVal = toValue(gear);

        if (gearVal.Released === undefined || tier == 0) {
            return {};
        }
        
        const gearStats = {}
        for (let i = 0; i < gearVal.StatType.length; i++) {
            gearStats[gearVal.StatType[i]] = {total: gearVal.StatValue[i][1], totalStr: '+' + gearVal.StatValue[i][1].toLocaleString()};
        }

        return gearStats;
    })

    return { calculatedStats }
}

export function interpolateStat([stat1, stat100], level, transcendence = 1, growthType = 'Standard') {
    const scale = getLevelScale(level, growthType)

    return Math.ceil((Math.round((stat1 + (stat100 - stat1) * scale).toFixed(4)) * transcendence).toFixed(4))
}

export function criticalChance(crit, critRes) {
    return clamp(1 - (4000000 / (Math.max(crit - critRes, 0) * 6000 + 4000000)), 0, 1);
}

export function defMitigation(def, penetrationBase = 0, ignoreRate = 10000) {
    const defense = Math.max((def - penetrationBase) * (ignoreRate / 10000), 0);
    return (10000000 / (defense * 6000 + 10000000));
}

export function stabilityMinimum(stabilityPoint, stabilityRate) {
    return clamp((stabilityPoint / (stabilityPoint + 1000)) + (stabilityRate / 10000), 0, 1);
}

export function getLevelScale(level, growthType) {
    switch (toValue(growthType)) {
        case 'TimeAttack':
            if (level <= 1) {
                return 0;
            } else if (level == 2) {
                return 0.0101;
            } else if (level <= 24) {
                return 0.0707;
            } else if (level == 25) {
                return 0.0808;
            } else if (level <= 39) {
                return 0.1919;
            } else if (level == 40) {
                return 0.2020;
            } else if (level <= 64) {
                return 0.4444;
            } else if (level == 65) {
                return 0.4545;
            } else if (level <= 77) {
                return 0.7172;
            } else if (level == 78) {
                return 0.7273;
            } else {
                return parseFloat(((level-1)/99).toFixed(4));
            }
        case 'LateBloom':
        case 'Premature':
            return (level-1) / 99;
        default:
            return parseFloat(((level-1) / 99).toFixed(4));
    }

}

export function buffValueToString(stat, value) {
    const [statName, buffType] = stat.split('_');

    let amountStr;

    if (buffType == 'Coefficient') {
        amountStr = `${+(value / 100).toFixed(2).toLocaleString()}%`;
    } else {
        amountStr = value.toLocaleString();
    }

    return `${value >= 0 ? '+' : ''}${amountStr}`
}

export const adaptation = {
    0: 'D',
    1: 'C',
    2: 'B',
    3: 'A',
    4: 'S',
    5: 'SS'
}