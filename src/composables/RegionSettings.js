import { computed } from "vue";
import { useDataStore } from "../stores/DataStore";
import { useSettingsStore } from "../stores/SettingsStore";

export const regionSettings = computed(() => {
    const configData = useDataStore().config.data
    const settings = useSettingsStore().settings;
    const region = configData.Regions[settings.server];
    return {
        ServerName: region.Name,
        AccountMaxLevel: region.StudentMaxLevel,
        WeaponMaxLevel: region.WeaponMaxLevel,
        BondMaxLevel: region.BondMaxLevel,
        EquipmentMaxLevel: region.EquipmentMaxLevel,
        WeaponUnlocked: region.WeaponMaxLevel > 0,
        WeaponMaxStarGrade: (region.WeaponMaxLevel / 10) - 2,
        GearUnlocked: true,
        BulletTypes: ['Normal', 'Explosion', 'Pierce', 'Mystic', 'Sonic'],
        ArmorTypes: ['Normal', 'LightArmor', 'HeavyArmor', 'Unarmed', 'ElasticArmor'],
        CampaignMax: region.CampaignMax,
        CampaignExtra: region.CampaignExtra,
        ChaserMax: region.ChaserMax,
        BloodMax: region.BloodMax,
        FindGiftMax: region.FindGiftMax,
        SchoolDungeonMax: region.SchoolDungeonMax,
        FurnitureSetMax: region.FurnitureSetMax,
        FurnitureTemplateMax: region.FurnitureTemplateMax,
        Events: region.Events,
        CurrentGacha: region.CurrentGacha,
        CurrentRaid: region.CurrentRaid,
        CurrentEvents: region.CurrentEvents
    }
})