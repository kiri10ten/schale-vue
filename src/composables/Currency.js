import currencyData from "../assets/data/en/currency.json";

export const currencyMap = {};

for (const currency of currencyData) {
    currencyMap[currency.Id] = currency;
}

export function getCurrencyById(id) {
    return currencyMap[id];
}