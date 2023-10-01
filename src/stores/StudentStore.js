import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage, useSessionStorage } from '@vueuse/core'
import { useSettingsStore } from './SettingsStore'
import merge from 'lodash/merge'

export const useStudentStore = defineStore('studentstore', {
    state: () => {

        const studentDisplay = ref(useLocalStorage('studentDisplay', {
            ActiveTab: 'stats',

            Level: 1,
            StarGrade: 3,
            WeaponStarGrade: 0,
            WeaponLevel: 1,
            Equipment: [1, 1, 1],
            Gear: false,
            BondLevel: [20, 20, 20],
            SkillEx: 5,
            SkillPassive: 10,

            IncludePassive: false,
            IncludeEquipment: false,
            IncludeBond: false,

            SkillDisplay: {
                ShowUpgrades: false,
                Ex: 1,
                PublicPassiveSub: 1,
                WeaponPassive: 1,
                GearPublic: 1,
                ExShowMaterials: false,
                PublicPassiveSubShowMaterials: false,
            },
            WeaponLevelDisplay: 1,
            BondLevelDisplay: 1,
        }))

        const studentCollection = ref(useLocalStorage('studentCollection', {
            0: {},
            1: {},
            2: {}
        }))
        
        const studentListFilters = ref(useSessionStorage('studentListFilters', {
            SearchTerm: "",
            Collection: {
                Owned: false,
                NotOwned: false,
            },
            SquadType: {
                Main: false,
                Support: false,
            },
            TacticRole: {
                Tanker: false,
                DamageDealer: false,
                Healer: false,
                Supporter: false,
                Vehicle: false,
            },
            StarGrade: {
                3: false,
                2: false,
                1: false,
            },
            IsLimited: {
                0: false,
                1: false,
                2: false,
            },
            BulletType: {
                Explosion: false,
                Pierce: false,
                Mystic: false,
                Sonic: false
            },
            ArmorType: {
                LightArmor: false,
                HeavyArmor: false,
                Unarmed: false,
                ElasticArmor: false
            },
            School: {
                Abydos: false,
                Arius: false,
                Gehenna: false,
                Hyakkiyako: false,
                Millennium: false,
                RedWinter: false,
                Shanhaijing: false,
                Trinity: false,
                Valkyrie: false,
                SRT: false,
                ETC: false,
            },
            WeaponType: {
                SG: false,
                SMG: false,
                AR: false,
                GL: false,
                HG: false,
                SR: false,
                RG: false,
                MG: false,
                RL: false,
                MT: false,
                FT: false
            },
            Position: {
                Front: false,
                Middle: false,
                Back: false,
            },
            Equipment1: {
                Hat: false,
                Gloves: false,
                Shoes: false
            },
            Equipment2: {
                Bag: false,
                Badge: false,
                Hairpin: false
            },
            Equipment3: {
                Charm: false,
                Necklace: false,
                Watch: false
            },
            StreetBattleAdaptation: {
                0: false,
                1: false,
                2: false,
                3: false,
                4: false,
                5: false
            },
            OutdoorBattleAdaptation: {
                0: false,
                1: false,
                2: false,
                3: false,
                4: false,
                5: false
            },
            IndoorBattleAdaptation: {
                0: false,
                1: false,
                2: false,
                3: false,
                4: false,
                5: false
            },
            Gear: false,
            Cover:  {
                true: false,
                false: false,
            },
            ShowInfo: false,
        }, {
            mergeDefaults: (storage, defaults) => merge(defaults, storage)
        }))

        const studentListSort = ref(useSessionStorage('studentListSort', {
            SortKey: 'Id',
            Mode: 1,
            UseCollectionStats: false,
        }))

        return { studentDisplay, studentListFilters, studentListSort, studentCollection }
    },
    actions: {
        collectionExists(studentId) {
            const settings = useSettingsStore().settings;
            const server = settings.collectionPerServer ? settings.server : 0;
            return this.studentCollection[server][studentId] !== undefined;
        },
        collectionLocked(studentId) {
            const settings = useSettingsStore().settings;
            const server = settings.collectionPerServer ? settings.server : 0;
            return this.studentCollection[server][studentId]?.Lock ?? false;
        },
        collectionUpdate(studentId, ...altIds) {
            const settings = useSettingsStore().settings;
            const server = settings.collectionPerServer ? settings.server : 0;

            if (this.studentCollection[server][studentId]?.Lock === true) {
                return;
            }

            this.studentCollection[server][studentId] = {
                Level: this.studentDisplay.Level,
                StarGrade: this.studentDisplay.StarGrade,
                WeaponStarGrade: this.studentDisplay.WeaponStarGrade,
                WeaponLevel: this.studentDisplay.WeaponLevel,
                Equipment: this.studentDisplay.Equipment,
                Gear: this.studentDisplay.Gear,
                BondLevel: this.studentDisplay.BondLevel[0],
            }

            altIds.forEach((altId, i) => {
                if (this.studentCollection[server][altId] !== undefined) {
                    this.studentCollection[server][altId].BondLevel = this.studentDisplay.BondLevel[i + 1];
                }
            });

        },
        collectionGet(studentId, ...altIds) {
            const settings = useSettingsStore().settings;
            const server = settings.collectionPerServer ? settings.server : 0;
            const collectionStats = {}

            if (this.studentCollection[server][studentId] !== undefined) {
                collectionStats.Level = this.studentCollection[server][studentId].Level;
                collectionStats.StarGrade = this.studentCollection[server][studentId].StarGrade;
                collectionStats.WeaponStarGrade = this.studentCollection[server][studentId].WeaponStarGrade;
                collectionStats.WeaponLevel = this.studentCollection[server][studentId].WeaponLevel;
                collectionStats.Equipment = this.studentCollection[server][studentId].Equipment;
                collectionStats.Gear = this.studentCollection[server][studentId].Gear;
                collectionStats.BondLevel = [this.studentCollection[server][studentId].BondLevel];

                altIds.forEach((altId) => {
                    if (this.studentCollection[server][altId] !== undefined) {
                        collectionStats.BondLevel.push(this.studentCollection[server][altId].BondLevel);
                    } else {
                        collectionStats.BondLevel.push(1);
                    }
                });
            }

            return collectionStats;

        },
        collectionLoad(studentId, ...altIds) {
            const settings = useSettingsStore().settings;
            const server = settings.collectionPerServer ? settings.server : 0;

            if (this.studentCollection[server][studentId] !== undefined) {
                this.studentDisplay.Level = this.studentCollection[server][studentId].Level;
                this.studentDisplay.StarGrade = this.studentCollection[server][studentId].StarGrade;
                this.studentDisplay.WeaponStarGrade = this.studentCollection[server][studentId].WeaponStarGrade;
                this.studentDisplay.WeaponLevel = this.studentCollection[server][studentId].WeaponLevel;
                this.studentDisplay.Equipment = this.studentCollection[server][studentId].Equipment;
                this.studentDisplay.Gear = this.studentCollection[server][studentId].Gear;
                this.studentDisplay.BondLevel[0] = this.studentCollection[server][studentId].BondLevel;
            }

            altIds.forEach((altId, i) => {
                if (this.studentCollection[server][altId] !== undefined) {
                    this.studentDisplay.BondLevel[i + 1] = this.studentCollection[server][altId].BondLevel;
                }
            });
        },
        collectionRemove(studentId) {
            const settings = useSettingsStore().settings;
            const server = settings.collectionPerServer ? settings.server : 0;

            delete this.studentCollection[server][studentId];
        },
        collectionLock(studentId) {
            const settings = useSettingsStore().settings;
            const server = settings.collectionPerServer ? settings.server : 0;

            this.studentCollection[server][studentId].Lock = !this.studentCollection[server][studentId].Lock ?? true;
        }
    }

})
