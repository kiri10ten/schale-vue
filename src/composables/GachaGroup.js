import { useDataStore } from "../stores/DataStore";

export const gachaGroupData = useDataStore().config.data.GachaGroups;

export const gachaGroupMap = {};

for (const gachaGroup of gachaGroupData) {
    gachaGroupMap[gachaGroup.Id] = gachaGroup;
}

export function getGachaGroupById(id) {
    return gachaGroupMap[id];
}