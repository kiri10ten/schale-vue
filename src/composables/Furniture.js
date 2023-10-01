import { useDataStore } from "../stores/DataStore";

const furnitureData = useDataStore().furniture.data;

export const furnitureMap = {};

for (const furniture of furnitureData) {
    furnitureMap[furniture.Id] = furniture;
}

export function getFurnitureById(id) {
    return furnitureMap[id];
}