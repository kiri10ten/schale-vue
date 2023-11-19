import { useDataStore } from "../stores/DataStore";
import { useSettingsStore } from "../stores/SettingsStore";
import { regionSettings } from "./RegionSettings";

const craftingData = useDataStore().crafting.data;

export const craftNodeMap = {};

for (const craftNode of craftingData.Nodes) {
    craftNodeMap[craftNode.Id] = craftNode;
}

export function getCraftNodeById(id) {
    return craftNodeMap[id];
}

export function getCraftingTotalWeight(tier) {
    const settings = useSettingsStore().settings;
    return craftingData.TotalProp[regionSettings.value.ServerName.toLowerCase()][tier - 1];
}

export function* craftNodeGenerator() {
    for (const craftNode of craftingData.Nodes) {
        yield craftNode;
    }
}