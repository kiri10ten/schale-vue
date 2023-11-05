import { useDataStore } from "../stores/DataStore";

const enemyData = useDataStore().enemies.data;

const enemyMap = {};

for (const enemy of enemyData) {
    enemyMap[enemy.Id] = enemy;
}

export function getEnemyById(id) {
    return enemyMap[id];
}