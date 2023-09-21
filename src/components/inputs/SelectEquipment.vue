<script setup>
import { computed } from 'vue';
import { regionSettings } from '../../composables/RegionSettings';
import { equipmentTypes, getEquipmentByType } from '../../composables/Equipment';
import { translateUi } from '../../composables/Localization';

const props = defineProps({
    equipmentType: String,
    equipmentTier: Number
});

const emit = defineEmits(['update:equipmentTier']);

const equipmentList = computed(() => {
    const slot = Math.ceil(equipmentTypes[props.equipmentType] / 3);
    const maxTier = regionSettings.value.EquipmentMaxLevel[slot - 1];

    const equipments = [];
    for (let i = 0; i < maxTier; i++) {
        equipments.push(getEquipmentByType(props.equipmentType, i + 1));
    }
    return equipments
})

const currentEquipment = computed(() => {
    if (props.equipmentTier == 0) {
        return null;
    } else {
        return getEquipmentByType(props.equipmentType, props.equipmentTier);
    }
})

function setEquipmentLevel(n) {
    emit('update:equipmentTier', n);
}

</script>

<template>
    <div class="dropdown">
        <button class="btn-pill" data-bs-toggle="dropdown">
            <div class="icon">
                <img class="ba-item-n" :src="equipmentTier > 0 ? `/images/equipment/icon/${currentEquipment.Icon}.webp` : '/images/gear/empty.png'" width="28" height="28">
            </div>
            <span class="label">
                {{ 'T' + equipmentTier }}
            </span>
            <fa icon="caret-down" class="me-2"></fa>
        </button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-start">
            <li>
                <button class="dropdown-item dropdown-item-icon" :class="{ active: equipmentTier == 0 }" @click="setEquipmentLevel(0)">
                    <div class="icon"><img class="ba-item-n" :src="'/images/gear/empty.png'"></div>
                    <span>T0</span>
                </button>
            </li>
            <li v-for="equipment in equipmentList">
                <button class="dropdown-item dropdown-item-icon" :class="{ active: equipmentTier == equipment.Tier }" @click="setEquipmentLevel(equipment.Tier)">
                    <div class="icon"><img class="ba-item-n" :src="`/images/equipment/icon/${equipment.Icon}.webp`"></div>
                    <span>{{ 'T' + equipment.Tier }}</span>
                </button>
            </li>
        </ul>
    </div>
</template>