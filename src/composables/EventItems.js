import { flatten, sum } from "lodash";
import { useStudentStore } from "../stores/StudentStore";
import { getItemById } from "./Items";

export function getEventItemBonus(id, teams, ownedOnly = false) {
    const item = getItemById(id);

    const bonusStudents = {"Main": Array(teams*4).fill(null), "Support": Array(teams*2).fill(null)};

    if (item.EventBonus) {
        
        const studentStore = useStudentStore();

        for (const bonus of item.EventBonus) {

            if (ownedOnly && !studentStore.collectionExists(bonus[0])) {
                continue;
            }

            const squadType = bonus[0] < 20000 ? 'Main' : 'Support';

            for (const [index, current] of Object.entries(bonusStudents[squadType])) {
                if (current == null || bonus[1] > current[1]) {
                    bonusStudents[squadType][index] = bonus;
                    break;
                }
            }
        }

    }

    const students = flatten(Object.values(bonusStudents)).filter(s => s !== null);

    return {total: sum(students.map(r => r?.[1] ?? 0)), students};

}