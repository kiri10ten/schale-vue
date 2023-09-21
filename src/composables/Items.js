import itemData from "../assets/data/en/items.json";

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