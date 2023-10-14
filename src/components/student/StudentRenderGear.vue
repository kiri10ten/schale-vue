<script setup>
import { computed, toRefs } from 'vue';
import { useStudentStore } from '../../stores/StudentStore';
import SkillPanel from './skills/SkillPanel.vue';
import { translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { useSettingsStore } from '../../stores/SettingsStore';
import { useGearStats, useWeaponStats } from '../../composables/CharacterStats';
import StatsTable from '../common/StatsTable.vue';
import ItemIcon from '../common/ItemIcon.vue';
import { abbreviateNumber } from '../../composables/Utilities';

const studentDisplay = useStudentStore().studentDisplay;

const props = defineProps({
    student: {
        type: Object,
        required: true
    }
});

const gearPublicSkills = computed(() => {
    return [{type: 'GearPublic', skill: props.student.Skills.GearPublic}]
});

const gearStats = useGearStats(computed(() => {return props.student.Gear}), 1);

const upgradeMaterials = computed(() => {
    const materials = [];

    for (let i = 0; i < props.student.Gear.TierUpMaterial[0].length; i++) {
        materials.push({
            type: 'Item',
            id: props.student.Gear.TierUpMaterial[0][i],
            amount: props.student.Gear.TierUpMaterialAmount[0][i]
        })       
    }

    materials.push({
        type: 'Currency',
        id: 1,
        amount: 500000
    })

    return materials;
})

</script>

<template>
    <div class="w-100 px-1">
        <h3>{{ student.Gear.Name }}</h3>
        <p class="text-italic mb-2">{{ translateUi('student_ex_gear') }}</p>
    </div>
    <div class="ba-panel">
        <p class="text-center mb-0 p-2"><img class="item-icon-full" :src="`/images/gear/full/${student.Id}.webp`"></p>
        <div class="ba-stats">
            <StatsTable :character-stats="gearStats"></StatsTable>
        </div>
        <p class="p-2">{{ student.Gear.Desc }}</p>
    </div>

    <div class="tab-content">
        <div id="gear-t2" class="tab-pane active show">

            <div class="my-3 p-2 d-flex flex-column ba-panel">
                <i class="mb-2" v-html="translateUi('bond_req_upgrade', 25, student.Name)"></i>
                <i class="mb-2">{{ translateUi('craft_using') }}</i>
                <div class="item-icon-list">
                    <ItemIcon v-for="material in upgradeMaterials" :item-type="material.type" :item-id="material.id" :primary-label="`&times;${abbreviateNumber(material.amount)}`"></ItemIcon>
                </div>
            </div>

            <SkillPanel :skills="gearPublicSkills" v-model:skill-level="studentDisplay.SkillDisplay.GearPublic" :bullet-type="student.BulletType" :max-level="10"></SkillPanel>

        </div>
    </div>
</template>