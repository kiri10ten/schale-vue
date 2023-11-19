import { useDataStore } from "../stores/DataStore";
import { useSettingsStore } from "../stores/SettingsStore";
import { translate } from "./Localization";

const stageData = useDataStore().stages.data;
const stageMap = {};

const stageCampaignDifficulty = {
    0: 'Normal',
    1: 'Hard'
}

for (const stage of stageData.Campaign) {
    stage.Category = 'Campaign';
    stage.Title = `${translate('StageType', stageCampaignDifficulty[stage.Difficulty])} ${stage.Area}-${stage.Stage}`;
    stageMap[stage.Id] = stage;
}

for (const stage of stageData.WeekDungeon) {
    stage.Category = 'WeekDungeon';
    stage.Name = translate('StageTitle', stage.Type, String.fromCharCode(64 + stage.Stage));
    stageMap[stage.Id] = stage;
}

for (const stage of stageData.SchoolDungeon) {
    stage.Category = 'SchoolDungeon';
    stage.Name = translate('StageTitle', stage.Type, String.fromCharCode(64 + stage.Stage));
    stageMap[stage.Id] = stage;
}

export function getStageById(id) {
    return stageMap[id];
}

export function* campaignStageGenerator() {
    for (const stage of stageData.Campaign) {
        yield stage;
    }
}

export function* weekDungeonStageGenerator() {
    for (const stage of stageData.WeekDungeon) {
        yield stage;
    }
}

export function* schoolDungeonStageGenerator() {
    for (const stage of stageData.SchoolDungeon) {
        yield stage;
    }
}