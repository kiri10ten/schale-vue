import { computed, toValue } from "vue";
import { getItemsInCategory } from "./Items";
import { useSettingsStore } from "../stores/SettingsStore";
import { studentsGenerator } from "./Student";
import { useStudentStore } from "../stores/StudentStore";

export const genericGiftTags = ["Gift1", "Gift2", "Gift3"];

export function useGiftsByStudent(studentRef) {

    return computed(() => {
        
        const student = toValue(studentRef);

        const allGifts = getItemsInCategory('Favor', useSettingsStore().settings.server);

        const studentGifts = [];
    
        for (const gift of allGifts) {

            const allTags = [...student.FavorItemTags, ...student.FavorItemUniqueTags, ...genericGiftTags];
            const genericTagCount = gift.Tags.filter(x => genericGiftTags.includes(x)).length;

            const commonTags = gift.Tags.filter(x => allTags.includes(x));
            const favorGrade = Math.min(commonTags.length, 3);

            const expValue = gift.ExpValue * (1 + Math.min(commonTags.length, 3))

            if (favorGrade - genericTagCount > 0) {
                studentGifts.push({
                    gift: gift,
                    exp: expValue,
                    grade: favorGrade + 1
                });
            }
        }

        return studentGifts.sort((a,b) => b.exp - a.exp);

    })

}

export function useStudentsByGift(giftRef, ownedOnlyRef) {

    return computed(() => {

        const gift = toValue(giftRef);
        const ownedOnly  = toValue(ownedOnlyRef);
        const students = {1: [], 2: [], 3: [], 4: []};
        const studentStore = useStudentStore();

        for (const student of studentsGenerator()) {

            if (ownedOnly && !studentStore.collectionExists(student.Id)) {
                continue;
            }
            
            const allTags = [...student.FavorItemTags, ...student.FavorItemUniqueTags, ...genericGiftTags];
            const genericTagCount = gift.Tags.filter(x => genericGiftTags.includes(x)).length;

            const commonTags = gift.Tags.filter(x => allTags.includes(x));
            const favorGrade = Math.min(commonTags.length, 3);

            if (favorGrade - genericTagCount > 0) {
                students[favorGrade + 1].push({
                    id: student.Id,
                    name: student.Name,
                    path: student.PathName
                })
            }

        }

        return students;

    })

}