import furnitureData from "../assets/data/en/furniture.json";

export const furnitureMap = {};

for (const furniture of furnitureData) {
    furnitureMap[furniture.Id] = furniture;
}

export function getFurnitureById(id) {
    return furnitureMap[id];
}