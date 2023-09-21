import { ref, reactive, computed, toValue } from "vue";
import { getStudentById } from "./Student";

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
            ExtendBuffDuration: char.ExtendBuffDuration ?? 10000,
            ExtendDebuffDuration: char.ExtendDebuffDuration ?? 10000,
            ExtendCCDuration: char.ExtendCCDuration ?? 10000
        }
    });

    console.log('created new stats', stats)

    const growthType = ref('Standard');
    const transcendence = {
        AttackPower: char.Transcendence?.[0] ?? [0, 1000, 1200, 1400, 1700],
        MaxHP: char.Transcendence?.[1] ?? [0, 500, 700, 900, 1400],
        HealPower: char.Transcendence?.[2] ?? [0, 750, 1000, 1200, 1500],
    };

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
            base = interpolateStat(base, level.value, 1 + ((transcendence[stat]?.slice(0, starGrade.value).reduce((pv, cv) => pv + cv, 0) ?? 0) / 10000), growthType);
        }

        const bonuses = {
            Base: 0,
            Coefficient: 1,
            BaseOuter: 0,
        }

        
        for (const id in buffs) {

            for (let i = 0; i < buffs[id].length; i++) {
                const buff = buffs[id][i];

                if (buff.stat == stat && toValue(buff.enabled)) {
    
                    if (buff.type == 'Coefficient') {
                        bonuses[buff.type] += toValue(buff.amount) / 10000;
                    } else {
                        bonuses[buff.type] += toValue(buff.amount);
                    }
                    
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

        let totalStr;

        if (stat == 'DamagedRatio') {
            totalStr = ((total - 10000) / 100).toFixed(0).toLocaleString() + "%";
        } else if (stat == 'AttackSpeed' || stat.slice(-4) == 'Rate') {
            totalStr = (total/100).toFixed(0).toLocaleString() + "%"
        } else if (stat == 'AmmoCount') {
            totalStr = total.toLocaleString() + ` (${stats.value.AmmoCost})`
        } else {
            totalStr = total.toLocaleString()
        }

        return { base, bonuses, total: allowNegative ? total : Math.max(total, 0), totalStr }
    }

    const calculatedStats = computed(() => {

        const calculated = {};

        for (const stat in stats.value) {
            calculated[stat] = calculate(stat);
        }

        return calculated;
        
    })

    return {level, starGrade, buffs, setBuff, removeBuff, calculate, calculatedStats}
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
            const total = interpolateStat(stats.value[stat], level.value, 1, growthType)
            calculated[stat] = {total: total, totalStr: '+'+total.toLocaleString()}
        }

        return calculated;
        
    })

    return {stats, level, calculatedStats}
}

export function useStudentBondStats(student, level, includeAlts) {

    const calculatedStats = computed(() => {
        const studentVal = toValue(student);
        const levelVal = toValue(level);

        const bondStats = {};

        const bondTargets = includeAlts ? [studentVal, ...studentVal.FavorAlts.map(id => getStudentById(id))] : [studentVal];

        bondTargets.forEach((target, targetInd) => {

            target.FavorStatType.forEach((stat, statInd) => {

                if (!(stat in bondStats)) {
                    bondStats[stat] = 0;
                }

                for (let i = 1; i < Math.min(Array.isArray(levelVal) ? levelVal[targetInd] : levelVal, 50); i++) {

                    if (i < 20) {
                        bondStats[stat] += target.FavorStatValue[Math.floor(i / 5)][statInd]
                    } else if (i < 50) {
                        bondStats[stat] += target.FavorStatValue[2 + Math.floor(i / 10)][statInd]
                    }

                }

            })

        })

        const calculatedStats = {}

        for (const stat in bondStats) {
            calculatedStats[stat] = {total: bondStats[stat], totalStr: '+' + bondStats[stat].toLocaleString()};
        }

        return calculatedStats;
    })

    return { calculatedStats }

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

export function getLevelScale(level, growthType) {
    switch (growthType) {
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

export const adaptation = {
    0: 'D',
    1: 'C',
    2: 'B',
    3: 'A',
    4: 'S',
    5: 'SS'
}