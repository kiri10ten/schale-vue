<script setup>
import { computed, ref, toRef, watch } from 'vue';
import { upgradeSkillTypes } from '../composables/Skills';
import BuffTag from '../components/student/skills/BuffTag.vue';
import { statToBuffIcon } from '../composables/Buffs';
import { translate, translateUi } from '../composables/Localization';
import { buffValueToString } from '../composables/CharacterStats';

const props = defineProps({
    characterStats: {
        type: Object,
        required: true
    },
    skill: {
        type: Object,
        required: true
    },
    effectTarget: {
        type: String,
        required: true
    },
    enabled: Boolean,
    level: Number
});

const emit = defineEmits(['update:enabled', 'update:level']);

const skillEnabled = ref(props.enabled);// toRef(props, 'enabled');
const skillLevel = ref(props.level);// toRef(props, 'level');
const skillStacks = ref(1);

const availableEffects = computed(() => {
    return props.skill.Effects.filter((e) => e.Type == "Buff" && e.Target.includes(props.effectTarget));
})

const maxSkillStacks = computed(() => {
    return availableEffects.value[0].StackSame ?? availableEffects.value[0].Value.length;
})

const maxSkillLevel = computed(() => {
    return props.skill.Type == 'Ex' ? 5 : 10;
})

const computedBuffList = computed(() => {
    const buffList = [];

    for (const effect of availableEffects.value) {
        const amount = effect.Value[effect.StackSame ? 0 : skillStacks.value - 1][skillLevel.value - 1] * (effect.StackSame ? skillStacks.value : 1)

        buffList.push({
            label: props.skill.Name,
            stat: effect.Stat.split('_')[0],
            enabled: skillEnabled.value,
            type: effect.Stat.split('_')[1],
            amount: amount,
            icon: effect.Icon ?? (amount < 0 ? 'Debuff' : 'Buff') + '_' + (statToBuffIcon[effect.Stat.split('_')[0]] ?? effect.Stat.split('_')[0]),
            stacks: effect.StackSame ? skillStacks.value : 1
        });
    }

    return buffList;
})

const visibleEffects = computed(() => {
    const effects = [];

    for (const effect of availableEffects.value) {
        const amount = effect.Value[effect.StackSame ? 0 : skillStacks.value - 1][skillLevel.value - 1] * (effect.StackSame ? skillStacks.value : 1);
        const buffName = effect.Stat.split('_')[0];

        effects.push({
            amount: buffValueToString(effect.Stat, amount),
            channel: effect.Channel,
            buffType: amount >= 0 ? 'Buff' : 'Debuff',
            buffName: statToBuffIcon[buffName] ?? buffName
        })
    }

    return effects;
})

props.characterStats.setBuff(props.skill.Id, computedBuffList);

watch(skillEnabled, (val) => {emit('update:enabled', val)});
watch(skillLevel, (val) => {emit('update:level', val)});

</script>

<template>

<div class="d-flex flex-column gap-2">
    <div class="ba-panel p-2" :class="{disabled: !skillEnabled}">
        <div class="d-flex gap-3 align-items-start">
            <div class="skill-icon bg-skill small" :class="skill.BulletType.toLowerCase()">
                <img :src="`/images/skill/${skill.Icon}.webp`">
                <fa v-if="upgradeSkillTypes.includes(skill.Type)" icon="plus" class="plus-icon" />
            </div>
            <div class="flex-fill" style="min-width: 0;">
                <div class="d-flex gap-3 w-100">
                    <h5>{{ skill.Name }}</h5>
                    <span class="text-italic ms-auto no-wrap">{{ translate('SkillType', skill.Type) }}</span>
                </div>
                
                <p class="m-0">
                    <template v-for="(effect, index) in visibleEffects">
                        <template v-if="index > 0">, </template>
                        <BuffTag :type="effect.buffType" :name="effect.buffName" ></BuffTag>
                        <b class="ms-1">
                            {{ effect.amount }}
                        </b>
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
                <span class="label">{{ translateUi('setting_on') }}</span>
            </span>
        </button>
        <template v-if="maxSkillStacks > 1">
            <input type="range" :disabled="!skillEnabled" :class="{disabled: !skillEnabled}" class="form-range flex-fill" style="max-width: 20%;" v-model.number="skillStacks" min="1" :max="maxSkillStacks">
            <span class="ba-slider-label" :class="{disabled: !skillEnabled}">
                ×{{ skillStacks }}
            </span>
        </template>
        <input type="range" :disabled="!skillEnabled" :class="{disabled: !skillEnabled}" class="form-range flex-fill" v-model.number="skillLevel" min="1" :max="maxSkillLevel">
        <span class="ba-slider-label" :class="{disabled: !skillEnabled}">
            <img v-if="skillLevel == maxSkillLevel" :src="'/images/ui/ImageFont_Max.png'">
            <template v-if="skillLevel != maxSkillLevel">{{ `Lv.${skillLevel}` }}</template>
        </span>

    </div>
</div>


</template>