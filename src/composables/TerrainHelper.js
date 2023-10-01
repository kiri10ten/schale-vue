import { translate, translateUi } from "./Localization";

export const terrainList = ["Street", "Outdoor", "Indoor"];
export const adaptationGrade = {0: "D", 1: "C", 2: "B", 3: "A", 4: "S", 5: "SS"};
const adaptationDamage = {0: 0.8, 1: 0.9, 2: 1, 3: 1.1, 4: 1.2, 5: 1.3};
const adaptationBlock = {0: 0, 1: 15, 2: 30, 3: 45, 4: 60, 5: 75};

export function terrainAffinityText(terrain, affinity) {
    return translateUi('terrain_adaption_details', adaptationDamage[affinity], translate('AdaptationType', terrain).toLowerCase(), adaptationBlock[affinity])
}

export function terrainUpgradeText(terrain, oldAffinity, newAffinity) {
    return `${translateUi('terrain_adaption', translate('AdaptationType', terrain))} ${adaptationGrade[oldAffinity]} → <b>${adaptationGrade[newAffinity]}</b>\n${terrainAffinityText(terrain, newAffinity)}`
}

export function terrainTooltip(terrain, affinity) {
    return {
        title: translateUi('terrain_adaption', translate('AdaptationType', terrain)) + ` ${adaptationGrade[affinity]}`,
        icon: `/images/ui/Adaptresult${affinity}.png`,
        body: terrainAffinityText(terrain, affinity),
        iconSize: [30, 30]
    }
}