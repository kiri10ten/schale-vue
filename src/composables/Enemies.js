import { useDataStore } from "../stores/DataStore";

const enemyData = useDataStore().enemies.data;

const enemyMap = {};

export const rankSortOrder = {'NPC': 0, 'Minion': 1, 'Elite': 2, 'Champion': 3, 'Boss': 4};

for (const enemy of enemyData) {
    enemyMap[enemy.Id] = enemy;
}

export function getEnemyById(id) {
    return enemyMap[id];
}