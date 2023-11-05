import { cloneDeep, merge, mergeWith } from "lodash";
import { translate, translateUi } from "./Localization";
import { getBasicTooltip } from "./Tooltips";
import { computed, toValue } from "vue";
import { useSettingsStore } from "../stores/SettingsStore";

export const upgradeSkillTypes = ['GearPublic', 'WeaponPassive'];

export function usePersonalSkills(character, weaponStars, gearTier) {

    const settings = useSettingsStore().settings;

    return computed(() => {
        const skills = [];

        const skillTypes = [
            'Ex',
            toValue(gearTier) >= 2 && character.Gear.Released?.[settings.server] ? 'GearPublic' : 'Public',
            toValue(weaponStars) >= 2 ? 'WeaponPassive' : 'Passive',
            'ExtraPassive'
        ]

        for (const skillType of skillTypes) {
            const skill = cloneDeep(character.Skills[skillType]);

            skill.BulletType = character.BulletType;
            skill.Type = skillType;
            skill.Id = `${character.DevName}${skillType}`;

            if (skillType == 'WeaponPassive') {
                skill.Effects = [...character.Skills.Passive.Effects, ...character.Skills.WeaponPassive.Effects]
            }

            skills.push(skill);
        }
        
        return skills;
    })
}

export function getSkillSlot(type) {
    if (type == 'WeaponPassive') {
        return 'Passive';
    } else if (type == 'GearPublic') {
        return 'Public';
    } else {
        return type;
    }
}

export function getNormalSkill(skill, range) {
    const normalSkill = {
        ...skill,
        Name: translate('SkillType', 'Normal'),
        Parameters: [['100%']],
        Range: range
    };

    if (skill.Radius && skill.Radius.length) {
        switch (skill.Radius[0].Type) {
            case 'Circle':
                normalSkill.Desc = translateUi('skill_normalattack_circle');
                normalSkill.Icon = 'COMMON_SKILLICON_CIRCLE';
                break
            case 'Obb':
                normalSkill.Desc = translateUi('skill_normalattack_line');
                normalSkill.Icon = 'COMMON_SKILLICON_LINE';
                break
            case 'Fan':
                normalSkill.Desc = translateUi('skill_normalattack_fan');
                normalSkill.Icon = 'COMMON_SKILLICON_FAN';
                break
        }
    } else {
        normalSkill.Desc = translateUi('skill_normalattack_target');
        normalSkill.Icon = 'COMMON_SKILLICON_TARGET';
    }

    if (normalSkill.Effects[0].Type == 'DMGMulti') {
        normalSkill.Effects[0].HitsParameter = 1;
    }

    return normalSkill;

}

export function getSummonSkills(summon) {

    return summon.Skills.map((summonSkill) => {

        let skill;

        if (summonSkill.SkillType == 'autoattack') {
            skill = getNormalSkill(summonSkill, summon.Range);
        } else {
            skill = {...summonSkill};
        }

        skill.Name += ` <small>(${summon.Name})</small>`
        return skill;

    })
}