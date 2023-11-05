import { useSettingsStore } from "../stores/SettingsStore";
import { useStudentStore } from "../stores/StudentStore";
import { getEquipmentStats } from "./Equipment";
import { regionSettings } from "./RegionSettings";
import { useStudentBondStats } from './Bond';

export function getMaximumAttributes(student, useCollection = false) {

    const statTypes = ['MaxHP', 'AttackPower', 'HealPower', 'DefensePower', 'AccuracyPoint', 'DodgePoint', 'CriticalPoint', 'StabilityPoint', 'Range'];

    let level;
    let starGrade;
    let equipLevel;
    let weaponStarGrade;
    let weaponLevel;
    let bondLevel;
    let gearLevel;

    if (useCollection) {
        const inCollection = useStudentStore().collectionExists(student.Id);

        if (inCollection) {

            const collectionStats = useStudentStore().collectionGet(student.Id);

            level = collectionStats.Level;
            starGrade = collectionStats.StarGrade;
            equipLevel = collectionStats.Equipment;
            weaponStarGrade = collectionStats.WeaponStarGrade;
            weaponLevel = collectionStats.WeaponLevel;
            bondLevel = collectionStats.BondLevel;
            gearLevel = collectionStats.Gear ? 1 : 0;

        } else {

            const result = {};

            statTypes.forEach((stat) => {
                result[stat] = 0;
            })
        
            return result;

        }

    } else {

        level = regionSettings.value.AccountMaxLevel;
        starGrade = 5;
        equipLevel = regionSettings.value.EquipmentMaxLevel;
        weaponStarGrade = regionSettings.value.WeaponMaxStarGrade;
        weaponLevel = regionSettings.value.WeaponMaxLevel;
        bondLevel = [regionSettings.value.BondMaxLevel, ...student.FavorAlts.map(() => regionSettings.value.BondMaxLevel)]
        gearLevel = 1;

    }
    

    const stats = useCharacterStats(student, level, starGrade);

    for (let i = 0; i < 3; i++) {
        const equipmentStats = getEquipmentStats(student.Equipment[i], equipLevel[i], -1);
        const equipmentBuffList = [];
        for (const stat in equipmentStats) {
            equipmentBuffList.push({
                stat: stat.split('_')[0],
                enabled: true,
                type: stat.split('_')[1],
                amount: equipmentStats[stat]
            });
        }
        stats.setBuff(`Student_Equipment${i}`, equipmentBuffList)        
    }

    if (weaponStarGrade > 0) {

        const weaponStats = useWeaponStats(student.Weapon, weaponLevel);

        const weaponBuffList = []
        for (const stat in weaponStats.calculatedStats.value) {
            weaponBuffList.push({
                stat: stat,
                enabled: true,
                type: 'Base',
                amount: weaponStats.calculatedStats.value[stat].total
            });
        }
        
        stats.setBuff(`Student_UniqueWeapon`, weaponBuffList);

    }

    const bondStats = useStudentBondStats(student, bondLevel, true)
    const bondBuffList = [];

    for (const stat in bondStats.calculatedStats.value) {
        bondBuffList.push({
            stat: stat,
            enabled: true,
            type: 'Base',
            amount: bondStats.calculatedStats.value[stat].total
        });
    }

    stats.setBuff(`Student_BondBonus`, bondBuffList);
        
    if (student.Gear.Released?.[useSettingsStore().settings.server]) {
        const gearStats = useGearStats(student.Gear, gearLevel);

        const gearBuffList = [];
    
        for (const stat in gearStats.calculatedStats.value) {
            gearBuffList.push({
                stat: stat.split('_')[0],
                enabled: true,
                type: stat.split('_')[1],
                amount: gearStats.calculatedStats.value[stat].total
            });
        }
    
        stats.setBuff(`Student_Gear`, gearBuffList);
    }

    const result = {};
    statTypes.forEach((stat) => {
        result[stat] = stats.calculatedStats.value[stat].total;
    })

    return result;
}