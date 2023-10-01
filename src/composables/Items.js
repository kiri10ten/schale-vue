import { useDataStore } from "../stores/DataStore";

const itemData = useDataStore().items.data;

export const itemMap = {};

for (const item of itemData) {
    itemMap[item.Id] = item;
}

export function getItemById(id) {
    return itemMap[id];
}

export function getItemsInCategory(category, server) {
    return itemData.filter(item => item.Category === category && item.IsReleased[server]);
}