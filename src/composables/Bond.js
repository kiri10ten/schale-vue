import { computed, toValue } from "vue";
import { getStudentById } from "./Student";

export function useStudentBondStats(student, level, includeAlts) {

    const calculatedStats = computed(() => {
        const studentVal = toValue(student);
        const levelVal = toValue(level);

        const bondStats = {};

        const bondTargets = includeAlts ? [studentVal, ...studentVal.FavorAlts.map(id => getStudentById(id))] : [studentVal];

        bondTargets.forEach((target, targetInd) => {

            target.FavorStatType.forEach((stat, statInd) => {

                if (!(stat in bondStats)) {
                    bondStats[stat] = 0;
                }

                for (let i = 1; i < Math.min(Array.isArray(levelVal) ? levelVal[targetInd] : levelVal, 50); i++) {

                    if (i < 20) {
                        bondStats[stat] += target.FavorStatValue[Math.floor(i / 5)][statInd]
                    } else if (i < 50) {
                        bondStats[stat] += target.FavorStatValue[2 + Math.floor(i / 10)][statInd]
                    }

                }

            })

        })

        const calculatedStats = {}

        for (const stat in bondStats) {
            calculatedStats[stat] = {total: bondStats[stat], totalStr: '+' + bondStats[stat].toLocaleString()};
        }

        return calculatedStats;
    })

    return { calculatedStats }

}