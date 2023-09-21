<script setup>
import { useSettingsStore } from '../../stores/SettingsStore';


const props = defineProps({
    student: Object
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
    <RouterLink :to="{name: 'studentview', params: {studentid: student.Id }}" class="selection-grid-card card-student">
        <div class="card-img">
            <img :src="`/images/student/collection/${student.Id}.webp`">
        </div>
        <span class="card-badge student-role top-left" :class="`bg-${student.SquadType.toLowerCase()}-t`"><img :src="`/images/ui/Role_${student.TacticRole}.png`"></span>
        <span class="card-badge student-type atk" :class="`bg-atk-${student.BulletType.toLowerCase()}-t`"><img :src="'/images/ui/Type_Attack_s.png'"></span>
        <span class="card-badge student-type def" :class="`bg-def-${student.ArmorType.toLowerCase()}-t`"><img :src="'/images/ui/Type_Defense_s.png'"></span>
        <span class="card-badge student-rarity"><fa v-for="i in student.StarGrade" icon="star" /></span>
        <div class="card-label">
            <span class="label-text" :class="{smalltext: student.Name.length > smallTextChars[settings.language]}">{{ student.Name }}</span>
            <!-- <span class="label-text hover" :class="{smalltext: student.Name.length > smallTextChars[settings.language]}" style="display: none;">{{ student.Name }}</span> -->
        </div>
    </RouterLink>
</template>