export const statToBuffIcon = {
    "AttackPower": "ATK",
    "DefensePower": "DEF",
    "CriticalPoint": "CriticalChance",
    "CriticalDamageRate": "CriticalDamage",
    "CriticalDamageResistRate": "CriticalDamageRateResist",
    "DodgePoint": "Dodge",
    "HealEffectivenessRate": "HealEffectiveness",
    "AccuracyPoint": "HIT",
    "MaxHP": "MAXHP",
    "DefensePenetration": "Penetration",
    "StabilityPoint": "Stability",
    "StabilityRate": "Stability",
    "RegenCost": "CostRegen"
}

export function getBuffIconNameFromStat(stat) {
    return statToBuffIcon[stat] ?? stat;
}