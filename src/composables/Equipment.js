import { useDataStore } from "../stores/DataStore";

const equipmentData = useDataStore().equipment.data;

export const equipmentMap = {};

export const equipmentTypes = { 'Hat': 1, 'Gloves': 2, 'Shoes': 3, 'Bag': 4, 'Badge': 5, 'Hairpin': 6, 'Charm': 7, 'Watch': 8, 'Necklace': 9 }

for (const equipment of equipmentData) {
    equipmentMap[equipment.Id] = equipment;
}

export function getEquipmentById(id) {
    return equipmentMap[id];
}

export function getEquipmentStats(type, tier, level) {
    if (tier == 0) {
        return {};
    }
    
    const equipment = getEquipmentByType(type, tier);
    const stats = {}
    for (let i = 0; i < equipment.StatType.length; i++) {
        stats[equipment.StatType[i]] = interpolateStat(equipment.StatValue[i], [10, 10]) 
    }
    return stats
}

export function getEquipmentByType(type, tier) {
    return equipmentMap[(equipmentTypes[type] * 1000) + (tier - 1)];
}

export function* equipmentGenerator() {
    for (const id in equipmentMap) {
        yield equipmentMap[id];
    }
}

function interpolateStat([statMin, statMax], [levelMin, levelMax]) {
    const scale = parseFloat(((levelMin - 1) / (levelMax - 1))).toFixed(4);

    return Math.ceil(Math.round((statMin + (statMax - statMin) * scale).toFixed(4)))
}