import { useDataStore } from "../stores/DataStore";
import { useSettingsStore } from "../stores/SettingsStore";

export const raidEnemyLevel = [17, 25, 35, 50, 70, 80, 90];
export const raidDifficultyName = ['Normal', 'Hard', 'VeryHard', 'HardCore', 'Extreme', 'Insane', 'Torment'];
export const raidDifficultyNameAbbreviated = ['NOR', 'HRD', 'VHD', 'HC', 'EXT', 'INS', 'TOR'];

const raidData = useDataStore().raids.data;

const raidMap = {};
const timeAttackMap = {};
const worldRaidMap = {};
const timeAttackRuleMap = {};

for (const raid of raidData.Raid) {
    raidMap[raid.Id] = raid;
}

for (const raid of raidData.TimeAttack) {
    timeAttackMap[raid.Id] = raid;
}

for (const rule of raidData.TimeAttackRules) {
    timeAttackRuleMap[rule.Id] = rule;
}

for (const raid of raidData.WorldRaid) {
    worldRaidMap[raid.Id] = raid;
}

export function getRaidById(id) {
    return raidMap[id];
}

export function getWorldRaidById(id) {
    return worldRaidMap[id];
}

export function getTimeAttackById(id) {
    return timeAttackMap[id];
}

export function getRaidPathName(path) {
    return raidData.Raid.find(s => s.PathName == path);
}

export function getWorldRaidPathName(path) {
    return raidData.WorldRaid.find(s => s.PathName == path);
}

export function getRaidSeason(raidType, seasonId) {
    const settings = useSettingsStore().settings;
    return raidData.RaidSeasons[settings.server][raidType == 'EliminateRaid' ? 'EliminateSeasons' : 'Seasons'].find(s => s.SeasonId == seasonId);
}

export function getRaidSeasons(raidId) {
    const settings = useSettingsStore().settings;
    return {
        Raid: raidData.RaidSeasons[settings.server].Seasons.filter(s => s.RaidId == raidId),
        EliminateRaid: raidData.RaidSeasons[settings.server].EliminateSeasons.filter(s => s.RaidId == raidId)
    };
}

export function getRaidRewardSet(raidType, rewardSetId) {
    const settings = useSettingsStore().settings;
    return raidData.RaidSeasons[settings.server][raidType == 'EliminateRaid' ? 'EliminateRewardSets' : 'RewardSets'][rewardSetId];
}

export function getTimeAttackRule(id) {
    return timeAttackRuleMap[id];
}

export function* raidGenerator() {
    for (const id in raidMap) {
        yield raidMap[id];
    }
}

export function* worldRaidGenerator() {
    for (const id in worldRaidMap) {
        yield worldRaidMap[id];
    }
}

export function* timeAttackGenerator() {
    for (const id in timeAttackMap) {
        yield timeAttackMap[id];
    }
}