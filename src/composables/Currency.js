import { useDataStore } from "../stores/DataStore";

const currencyData = useDataStore().currency.data;

export const currencyMap = {};

for (const currency of currencyData) {
    currencyMap[currency.Id] = currency;
}

export function getCurrencyById(id) {
    return currencyMap[id];
}