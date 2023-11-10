<script setup>
import { regionSettings } from '../../composables/RegionSettings';

defineProps({
    starGrade: Number,
    weaponStarGrade: Number,
    weaponLevel: Number
});

const emit = defineEmits(['update:starGrade', 'update:weaponStarGrade', 'update:weaponLevel']);

function setStarGrade(n) {
    emit('update:starGrade', n);
    emit('update:weaponStarGrade', 0);
}

function setWeaponStarGrade(n) {
    emit('update:starGrade', 5);
    emit('update:weaponStarGrade', n);
    emit('update:weaponLevel', (n * 10) + 20);
}

</script>

<template>
    <div class="d-inline-block ba-panel statpreview-stars px-2 d-flex align-items-center">
        <span v-for="n in 5" class="ba-statpreview-star" :class="{active: starGrade >= n}" @click="setStarGrade(n)"><fa icon="star" /></span>
        <template v-if="regionSettings.WeaponUnlocked">
            <span v-for="n in regionSettings.WeaponMaxStarGrade" class="ba-weaponpreview-star weaponpreview-star-1" :class="{'ms-2': n == 1, active: weaponStarGrade >= n}" @click="setWeaponStarGrade(n)"><fa icon="star" /></span>
        </template>
    </div>
</template>