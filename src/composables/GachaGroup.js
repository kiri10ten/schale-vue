import { useDataStore } from "../stores/DataStore";

export const gachaGroupMap = useDataStore().groups.data;

export function getGachaGroupById(id) {
    return gachaGroupMap[id];
}