import { computed, toValue } from "vue";
import { getItemsInCategory } from "./Items";
import { useSettingsStore } from "../stores/SettingsStore";

const genericTags = ["Gift1", "Gift2"];

export function useGiftsByStudent(studentRef) {

    const gifts = computed(() => {
        
        const student = toValue(studentRef);

        const allGifts = getItemsInCategory('Favor', useSettingsStore().settings.server).sort((a,b) => b.ExpValue - a.ExpValue)
        const studentGifts = {1: [], 2: [], 3: [], 4: []};
    
        for (const gift of allGifts) {

            const allTags = [...student.FavorItemTags, ...student.FavorItemUniqueTags, ...genericTags];
            const genericTagCount = gift.Tags.filter(x => genericTags.includes(x)).length;

            const commonTags = gift.Tags.filter(x => allTags.includes(x));
            const favorGrade = Math.min(commonTags.length, 3);

            if (favorGrade - genericTagCount > 0) {
                studentGifts[favorGrade + 1].push(gift.Id);
            }
        }

        return studentGifts;

    })

    return gifts;

}