import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useStudentStore = defineStore('studentstore', () => {

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
    
    return { studentDisplay }

})
