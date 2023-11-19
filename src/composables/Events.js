import { cloneDeep, merge } from "lodash";
import { useDataStore } from "../stores/DataStore";
import { useSettingsStore } from "../stores/SettingsStore";
import { translate } from "./Localization";

const eventData = useDataStore().events.data;

const stageDifficulty = {
    0: 'Story',
    1: 'Quest',
    2: 'Challenge'
}

for (const eventId in eventData.Events) {
    eventData.Events[eventId].Id = +eventId;
}

for (const stage of eventData.Stages) {
    stage.Category = 'Event';
    stage.Title = `${stageDifficulty[stage.Difficulty]} ${String(stage.Stage).padStart(2, '0')}`;
}


for (const stage of eventData.ConquestStages) {
    stage.Category = 'Event';
    stage.Type = 'Conquest';
    stage.Title = translate('ConquestMap', stage.EventId);
}

export function getEventById(id) {
    return eventData.Events[id];
}

export function getEventStageById(id, version) {
    const stage = eventData.Stages.find(s => s.Id == id);

    if (stage && stage.VersionData[version]) {
        const clone = cloneDeep(stage);

        for (const override in stage.VersionData[version]) {
            clone[override] = stage.VersionData[version][override];
        }

        return clone;
    } else {
        return stage;
    }
}

export function getConquestMapById(id) {
    return eventData.ConquestMaps.find(s => s.EventId == id);
}

export function getConquestStageById(id) {
    return eventData.ConquestStages.find(s => s.Id == id);
}

export function getDefaultConquestStage(eventId) {
    return eventData.ConquestStages.find(s => s.EventId == eventId);
}


export function* eventGenerator() {
    for (const eventId in eventData.Events) {
        yield eventData.Events[eventId];
    }
}

export function* eventStageGenerator(eventId) {
    for (const stage of eventData.Stages.filter(s => s.EventId == eventId)) {
        yield stage;
    }
}