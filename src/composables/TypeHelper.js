import { computed, toValue } from "vue";
import { translate, translateUi } from "./Localization";
import { regionSettings } from "./RegionSettings";

export const TypeEffectiveness = {
    Normal: {
        LightArmor: 10000,
        HeavyArmor: 10000,
        Unarmed: 10000,
        Structure: 5000,
        ElasticArmor: 10000,
        Normal: 10000
    },
    Explosion: {
        LightArmor: 20000,
        HeavyArmor: 10000,
        Unarmed: 5000,
        Structure: 5000,
        ElasticArmor: 5000,
        Normal: 10000
    },
    Pierce: {
        LightArmor: 5000,
        HeavyArmor: 20000,
        Unarmed: 10000,
        Structure: 5000,
        ElasticArmor: 10000,
        Normal: 10000
    },
    Mystic: {
        LightArmor: 10000,
        HeavyArmor: 5000,
        Unarmed: 20000,
        Structure: 5000,
        ElasticArmor: 10000,
        Normal: 10000
    },
    Sonic: {
        LightArmor: 10000,
        HeavyArmor: 5000,
        Unarmed: 15000,
        Structure: 5000,
        ElasticArmor: 20000,
        Normal: 10000
    }
}

export function useBulletTypeTooltip(bulletTypeRef) {

    const tooltip = computed(() => {

        const bulletType = toValue(bulletTypeRef);
        const title = translate('BulletType', bulletType);
        const subtitle = translateUi('attacktype');
        let body = '';

        if (bulletType == 'Normal') {

            body = translateUi('attack_type_normal_desc');

        } else for (const armorType in TypeEffectiveness[bulletType]) {

            if (regionSettings.value.ArmorTypes.includes(armorType)) {
                const factor = TypeEffectiveness[bulletType][armorType] / 10000;
                if (factor != 1) {
                    body += body == '' ? '' : '\n';
                    body += translateUi("attack_type_desc", factor, `<b class='ba-col-${armorType.toLowerCase()}'>${translate("ArmorTypeLong", armorType)}</b>`);
                }
            }

        }

        return { title, subtitle, body };
    });

    return tooltip;

}

export function useArmorTypeTooltip(armorTypeRef) {

    const tooltip = computed(() => {

        const armorType = toValue(armorTypeRef);
        const title = translate('ArmorTypeLong', armorType);
        const subtitle = translateUi('defensetype');
        let body = '';

        if (armorType == 'Normal') {

            body = translateUi('defense_type_normal_desc');

        } else for (const bulletType in TypeEffectiveness) {

            if (regionSettings.value.BulletTypes.includes(bulletType)) {
                const factor = TypeEffectiveness[bulletType][armorType] / 10000;
                if (factor != 1) {
                    body += body == '' ? '' : '\n';
                    body += translateUi("defense_type_desc", factor, `<b class='ba-col-${bulletType.toLowerCase()}'>${translate("BulletType", bulletType)}</b>`);
                }
            }

        }

        return { title, subtitle, body };
    });

    return tooltip;

}