import { useDataStore } from "../stores/DataStore";

export function getGachaGroupById(id) {
    return useDataStore().groups.data[id];
}