import { useDataStore } from "../stores/DataStore";

const summonData = useDataStore().summons.data;

export const summonMap = {};

for (const summon of summonData) {
    summonMap[summon.Id] = summon;
}

export function getSummonById(summonId) {
    return summonMap[summonId];
}