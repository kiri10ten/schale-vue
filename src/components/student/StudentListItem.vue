<script setup>
import { useSettingsStore } from '../../stores/SettingsStore';


const props = defineProps({
    student: Object,
    useReplace: {
        type: Boolean,
        default: false
    }
})

const smallTextChars = {
    en: 10,
    jp: 5,
    kr: 5,
    tw: 5,
    cn: 5,
    zh: 5,
    th: 11,
    vi: 11
}

const settings = useSettingsStore().settings;

</script>

<template>
    <RouterLink :to="{name: 'studentview', params: {studentid: student.Id }}" class="selection-grid-card" :replace="useReplace">
        <div class="card-img">
            <img :src="`/images/student/collection/${student.Id}.webp`" loading="lazy">
        </div>
        <span class="card-badge student-role top-left" :class="[`bg-atk-${student.BulletType.toLowerCase()}`, `bg-hover-${student.SquadType.toLowerCase()}`]"><img :src="`/images/ui/Role_${student.TacticRole}.png`"></span>
        <span class="card-badge student-type atk" :class="`bg-atk-${student.BulletType.toLowerCase()}`"><img :src="'/images/ui/Type_Attack_s.png'"></span>
        <span class="card-badge student-type def" :class="`bg-def-${student.ArmorType.toLowerCase()}`"><img :src="'/images/ui/Type_Defense_s.png'"></span>
        <span class="card-badge student-rarity text-bold">
            <fa v-for="i in student.StarGrade" icon="star" />
            {{ student.IsLimited == 1 ? '(U)' : '' }}
            {{ student.IsLimited == 2 ? '(E)' : '' }}
        </span>
        <div class="card-label">
            <span v-if="student.LabelText == null" class="label-text" :class="{smalltext: student.Name.length > smallTextChars[settings.language], }">{{ student.Name }}</span>
            <template v-else>
                <span class="label-text unhover" :class="{smalltext: student.LabelText.length > smallTextChars[settings.language]}">{{ student.LabelText }}</span>
                <span class="label-text hover" :class="{smalltext: student.Name.length > smallTextChars[settings.language]}">{{ student.Name }}</span>
            </template>
        </div>
    </RouterLink>
</template>

<style lang="scss">
@import '../../styles/_mixins.scss';

.selection-grid-card {
    display: inline-block;
    font-size: 0px;

    .bg-hover-main, .bg-hover-support {
        @include transition(background-color);
    }
}

.show-info .selection-grid-card, .selection-grid-card:hover, .selection-grid-card:focus {

    .bg-hover-main {
        background-color: var(--col-bg-striker);
    }

    .bg-hover-support {
        background-color: var(--col-bg-special);
    }

}



</style>