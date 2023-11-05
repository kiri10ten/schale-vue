import { cloneDeep } from "lodash";
import { useDataStore } from "../stores/DataStore";
import { getSkillSlot } from "./Skills";

const studentData = useDataStore().students.data;

export const buffSkillList = [];

for (const student of studentData) {

    for (const skillType in student.Skills) {

        const skill = student.Skills[skillType];

        if (skill.Effects.some((e) => e.Type == 'Buff')) {
            const clonedSkill = cloneDeep(student.Skills[skillType]);

            clonedSkill.BulletType = student.BulletType;
            clonedSkill.SourceCharacterId = student.Id;
            clonedSkill.SourceCharacterName = student.Name;
            clonedSkill.Type = skillType;
            clonedSkill.Id = `${student.DevName}${skillType}`;
    
            buffSkillList.push(clonedSkill);
        }

    }

}

export function getConflictKey(skill, effect) {
    return `${getSkillSlot(effect.OverrideSlot ?? skill.Type)}${effect.Channel}`
}

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

export function getBuffSkillList(character, targetSide) {
    const isSummoned = character.Id >= 30000 && character.Id < 100000;

    return buffSkillList.filter((skill) => {

        if (isSummoned && (skill.SourceCharacterId >= 20000 && skill.SourceCharacterId < 30000) && skill.Type == 'ExtraPassive') {
            return false;
        }

        if (targetSide == 'Ally' && skill.SourceCharacterId == character.Id) {
            return false;
        }

        return getEligibleBuffEffects(character, targetSide, skill.Effects).length > 0;
    });
}

export function getEligibleBuffEffects(character, targetSide, effects) {

    const target = (targetSide == 'Ally' ? `${targetSide}${character.SquadType ?? 'Main'}` : targetSide)
    
    return effects.filter((effect) => {

        if (effect.Type != 'Buff') {
            return false;
        }

        if (!effect.Target.includes(target)) {
            return false;
        }

        if (effect.Restrictions) {

            for (const restriction of effect.Restrictions) {

                switch (restriction.Operand) {
                    case 'Equal':
                        if (character[restriction.Property] != restriction.Value) {
                            return false;
                        }
                        break;
                    case 'NotEqual':
                        if (character[restriction.Property] == restriction.Value) {
                            return false;
                        }
                        break;
                    case 'Contains':
                        if (!character[restriction.Property].includes(restriction.Value)) {
                            return false;
                        }
                        break;
                }

            }

        }

        return true;

    });
}

export function getSkillById(id) {
    return buffSkillList.find(s => s.Id == id) ?? null;
}

export function getBuffIconNameFromStat(stat) {
    return statToBuffIcon[stat] ?? stat;
}