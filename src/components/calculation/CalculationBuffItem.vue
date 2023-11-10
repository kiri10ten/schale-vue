<script setup>
import { computed, onUnmounted, ref, toRef, watch } from 'vue';
import { upgradeSkillTypes } from '../../composables/Skills';
import BuffTag from '../student/skills/BuffTag.vue';
import { getBuffIconNameFromStat, getConflictKey, getEligibleBuffEffects, statToBuffIcon } from '../../composables/Buffs';
import { translate, translateUi } from '../../composables/Localization';
import { buffValueToString } from '../../composables/CharacterStats';
import { useSettingsStore } from '../../stores/SettingsStore';
import { useStudentStore } from '../../stores/StudentStore';

const props = defineProps({
    targetCharacter: {
        type: Object,
        required: true
    },
    characterStats: {
        type: Object,
        required: true
    },
    skill: {
        type: Object,
        required: true
    },
    targetSide: {
        type: String,
        required: true
    },
    enabled: Boolean,
    level: Number,
    removable: Boolean
});

const emit = defineEmits(['update:enabled', 'update:level', 'remove']);

const skillEnabled = ref(props.enabled);// toRef(props, 'enabled');
const skillLevel = ref(props.level);// toRef(props, 'level');
const skillStacks = ref(1);

const settings = useSettingsStore().settings;
const studentStore = useStudentStore();

const availableEffects = computed(() => {
    return getEligibleBuffEffects(props.targetCharacter, props.targetSide, props.skill.Effects);
})

const maxSkillStacks = computed(() => {
    return availableEffects.value[0]?.StackSame ?? availableEffects.value[0]?.Value.length;
})

const maxSkillLevel = computed(() => {
    return props.skill.MaxLevel ?? (props.skill.Type == 'Ex' ? 5 : 10);
})

const computedBuffList = computed(() => {
    const buffList = [];

    for (const effect of availableEffects.value) {
        const amount = effect.Value[effect.StackSame ? 0 : skillStacks.value - 1][skillLevel.value - 1] * (effect.StackSame ? skillStacks.value : 1)

        if (amount != 0) {
            buffList.push({
                label: props.skill.Name,
                stat: effect.Stat.split('_')[0],
                enabled: skillEnabled.value,
                type: effect.Stat.split('_')[1],
                amount: amount,
                icon: effect.Icon ?? (amount < 0 ? 'Debuff' : 'Buff') + '_' + (statToBuffIcon[effect.Stat.split('_')[0]] ?? effect.Stat.split('_')[0]),
                conflictKey: getConflictKey(props.skill, effect),
                stacks: effect.StackSame ? skillStacks.value : 1
            });
        }

    }

    return buffList;
})

const visibleEffects = computed(() => {
    const effects = [];

    for (const effect of availableEffects.value) {
        const amount = effect.Value[effect.StackSame ? 0 : skillStacks.value - 1][skillLevel.value - 1] * (effect.StackSame ? skillStacks.value : 1);
        const buffName = effect.Stat.split('_')[0];

        const conflictKey =  getConflictKey(props.skill, effect);
        const isConflict = props.characterStats.calculatedStats.value[buffName].conflicts[conflictKey]?.includes(props.skill.Id + props.targetSide);

        if (amount != 0) {
            effects.push({
                amount: buffValueToString(effect.Stat, amount),
                channel: effect.Channel,
                name: effect.Icon ?? ((amount >= 0 ? 'Buff_' : 'Debuff_') + getBuffIconNameFromStat(buffName)),
                label: translate('Stat', buffName),
                isConflict: isConflict
            })
        }

    }

    return effects;
})

if (availableEffects.value.length == 0) {
    console.log('Removing buff - no available effects')
    emit('remove', props.skill.Id);
}

props.characterStats.setBuff(props.skill.Id + props.targetSide, computedBuffList);
console.log('Buff added', props.skill.Id)

watch(skillEnabled, (val) => {emit('update:enabled', val)});
watch(skillLevel, (val) => {emit('update:level', val)});

onUnmounted(() => {
    console.log('Buff removed', props.skill.Id)
    props.characterStats.removeBuff(props.skill.Id + props.targetSide);
})

</script>

<template>

<div class="d-flex flex-column gap-2">
    <div class="ba-panel p-2" :class="{disabled: !skillEnabled}">
        <div class="d-flex gap-3 align-items-start">

            <div v-if="skill.SourceCharacterId" class="transferable-skill-icon">
                <img class="student-icon" :src="`/images/student/icon/${skill.SourceCharacterId}.webp`">
                <img class="skill-icon bg-skill" :class="skill.BulletType.toLowerCase()" :src="`/images/skill/${skill.Icon}.webp`">
            </div>
            <div v-else class="skill-icon bg-skill small" :class="skill.BulletType.toLowerCase()">
                <img :src="`/images/skill/${skill.Icon}.webp`">
                <fa v-if="upgradeSkillTypes.includes(skill.Type)" icon="plus" class="plus-icon" />
            </div>

            <div class="flex-fill" style="min-width: 0;">
                <div class="d-flex gap-2 w-100 mb-1">
                    <div class="d-flex flex-wrap gap-1">
                        <h5 class="m-0">{{ skill.Name }}</h5>
                        <!-- <small v-if="settings.showDeveloperProps" class="align-self-end text-muted">{{ skill.Id }}</small> -->
                    </div>

                    <span class="text-italic ms-auto no-wrap align-self-start">
                        <template v-if="skill.Type == 'Custom'">User Defined</template>
                        <template v-else>
                            <template v-if="skill.SourceCharacterName">{{ skill.SourceCharacterName }} / </template>
                            {{ translate('SkillType', skill.Type) }}
                        </template>

                    </span>
                </div>
                
                <p class="m-0">
                    <template v-for="(effect, index) in visibleEffects">
                        <template v-if="index > 0">, </template>
                        <BuffTag :name="effect.name" :class="{conflict: effect.isConflict}" :label="effect.label" ></BuffTag>
                        <b class="ms-1" :class="{conflict: effect.isConflict}">
                            {{ effect.amount }}
                        </b>
                        <fa icon="warning" v-if="effect.isConflict" class="ms-1" v-tooltip="'Multiple bonuses of the same type and skill slot do not stack with each other.'" />
                    </template>
                </p>

            </div>
        </div>
    </div>
    <div class="d-flex align-items-center gap-2">
        <button class="btn-pill" :class="{deactivated: !skillEnabled}" @click="skillEnabled = !skillEnabled">
            <span class="label">
                <fa icon="square" class="off" />
                <fa icon="square-check" class="on" />
                <span class="ms-2">{{ translateUi('setting_on') }}</span>
            </span>
        </button>
        <button v-if="removable" class="btn-pill" @click="emit('remove', skill.Id)">
            <span class="label">
                <fa icon="trash" />
            </span>
        </button>
        <button v-if="removable && skill.Type != 'Custom'" class="btn-pill" :class="{deactivated: !studentStore.pinnedExists('Buffs', skill.Id)}" @click="studentStore.pinnedToggle('Buffs', skill.Id)">
            <span class="label">
                <fa icon="thumbtack" />
            </span>
        </button>
        <template v-if="maxSkillStacks > 1">
            <input type="range" :disabled="!skillEnabled" :class="{disabled: !skillEnabled}" class="form-range flex-fill" style="max-width: 20%;" v-model.number="skillStacks" min="1" :max="maxSkillStacks">
            <span class="ba-slider-label" :class="{disabled: !skillEnabled}">
                ×{{ skillStacks }}
            </span>
        </template>
        <template v-if="maxSkillLevel > 1">
            <input type="range" :disabled="!skillEnabled" :class="{disabled: !skillEnabled}" class="form-range flex-fill" v-model.number="skillLevel" min="1" :max="maxSkillLevel">
            <span class="ba-slider-label" :class="{disabled: !skillEnabled}">
                <img v-if="skillLevel == maxSkillLevel" :src="'/images/ui/ImageFont_Max.png'">
                <template v-if="skillLevel != maxSkillLevel">{{ `Lv.${skillLevel}` }}</template>
            </span>
        </template>
    </div>
</div>


</template>

<style scoped lang="scss">

.conflict {
    text-decoration: line-through;
    opacity: .6;
}

.transferable-skill-icon {

    width: 54px;
    min-width: 54px;
    height: 54px;

    .student-icon {
        width: 48px;
        height: 48px;
        margin: 0;
    }
    
    .skill-icon {
        left: 30px;
        top: 28px;
        height: 26px;
        width: 26px;
    }
}

</style>