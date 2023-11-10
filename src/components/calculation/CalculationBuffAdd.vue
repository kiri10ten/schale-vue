<script setup>
import { ref, computed, reactive } from 'vue';
import { translate, translateUi } from '../../composables/Localization';
import { allModifiableStats } from '../../composables/CharacterStats';
import { getStatIconName, getStatIconClass } from '../../composables/Icon';
import { getBuffIconNameFromStat, getBuffSkillList, getEligibleBuffEffects } from '../../composables/Buffs';
import Collapse from '../common/Collapse.vue';
import { useStudentStore } from '../../stores/StudentStore';

const props = defineProps({
    selectedSkills: {
        type: Array,
        required: true
    },
    targetCharacter: {
        type: Object,
        required: true
    }
});

const searchTerm = ref('');

const userDefinePanel = ref(false);
const showBuffSelection = ref(false);

const studentStore = useStudentStore();

const userDefineCount = ref(1);

const selectedUserDefineStat = ref('MaxHP');

const userDefineAmount = ref('');
const userDefineLabel = ref('');
const userDefineAmountCoefficient = ref(false);
const userDefineAmountNegative = ref(false);

const userDefineAmountInputMode = computed(() => {
    return userDefineAmountCoefficient.value ? 'decimal' : 'numeric';
})

const userDefineAmountStep = computed(() => {
    return userDefineAmountCoefficient.value ? 0.01 : 1;
})

const targetSide = ref('Ally');

const buffList = computed(() => {
    return {
        Ally: getBuffSkillList(props.targetCharacter, 'Ally'),
        Enemy: getBuffSkillList(props.targetCharacter, 'Enemy')
    };
})

const filteredBuffList = computed(() => {
    const list = [];

    console.log(buffList.value)

    const searchTermLower = searchTerm.value.toLowerCase();

    for (const buffSkill of buffList.value[targetSide.value]) {

        if (props.selectedSkills.some(s => (s.Skill.Id + s.TargetSide) == (buffSkill.Id + targetSide.value))) {
            continue;
        }

        if (searchTermLower !== "" && !buffSkill.SourceCharacterName.toLowerCase().includes(searchTermLower) && !buffSkill.Name.toLowerCase().includes(searchTermLower)) {
            continue;
        }

        list.push({
            Skill: buffSkill,
            Pinned: studentStore.pinnedExists('Buffs', buffSkill.Id) ? 1 : 0
        });

    }

    list.sort((a, b) => (b.Pinned - a.Pinned))

    return list;
})

function switchAmountMode() {
    userDefineAmountCoefficient.value = !userDefineAmountCoefficient.value;

    if (userDefineAmountCoefficient.value) {
        userDefineAmount.value = (+userDefineAmount.value).toFixed(2);
    } else {
        userDefineAmount.value = (+userDefineAmount.value).toFixed(0);
    }
}

function addBuffSkill(buffSkill) {
    props.selectedSkills.push({
        Skill: buffSkill,
        Enabled: true,
        Level: buffSkill.Type == 'Ex' ? 5 : 10,
        TargetSide: targetSide.value
    })

    showBuffSelection.value = false;
    searchTerm.value = '';
}

function addUserDefinedBuffSkill() {

    const value = +(userDefineAmountCoefficient.value ? (+userDefineAmount.value).toFixed(2) * 100 : (+userDefineAmount.value).toFixed(0));
    const amount = value * (userDefineAmountNegative.value ? -1 : 1)

    props.selectedSkills.push({
        Skill: {
            Id: `Custom${userDefineCount.value}`,
            Name: userDefineLabel.value != '' ? userDefineLabel.value : `User Defined ${userDefineCount.value}`,
            Type: 'Custom',
            Icon: `COMMON_SKILLICON_STAT${amount >= 0 ? 'BUFF' : 'DEBUFF'}`,
            BulletType: 'Normal',
            Effects: [
                {
                    Type: 'Buff',
                    Target: ['AllyMain', 'AllySupport'],
                    Value: [[amount]],
                    Stat: `${selectedUserDefineStat.value}_${userDefineAmountCoefficient.value ? 'Coefficient' : 'Base'}`,
                    Channel: userDefineCount.value
                }
            ],
            MaxLevel: 1,
        },
        Enabled: true,
        Level: 1,
        TargetSide: 'Ally'
    })

    userDefineCount.value += 1;
    userDefinePanel.value = false;
}

function getEffects(buffSkill) {
    const effectList = getEligibleBuffEffects(props.targetCharacter, targetSide.value, buffSkill.Effects);

    return effectList.map((effect) => {
        const maxStacks = effect.Value[effect.Value.length - 1]
        const maxAmount = maxStacks[maxStacks.length - 1]
        return `${maxAmount >= 0 ? 'Buff' : 'Debuff'}_${getBuffIconNameFromStat(effect.Stat.split('_')[0])}`;
    });
}

</script>

<template>

<div class="d-flex flex-column position-relative">
    <div class="d-flex gap-2 align-items-stretch mb-3 large">

        <input type="search" class="form-control circle px-3" autocomplete="off" v-model="searchTerm" :placeholder="translateUi('buff_transferable_search')">

        <button class="btn-pill" @click="showBuffSelection = !showBuffSelection">
            <span class="label">
                <fa icon="search" class="me-2" />
                Find
            </span>
        </button>

        <button class="btn-pill" :class="{active: userDefinePanel}" @click="userDefinePanel = !userDefinePanel">
            <span class="label">
                <fa icon="wrench"/>
            </span>
        </button>
    </div>

    <div v-if="showBuffSelection || searchTerm !== ''" class="search-list-container">
        <div class="search-list">
            <div class="search-list-controls px-2">
                <div class="btn-group">
                    <button class="btn-pill" :class="{active: targetSide == 'Ally'}" @click="targetSide = 'Ally'">
                        <span class="label">Ally</span>
                    </button>
                    <button class="btn-pill" :class="{active: targetSide == 'Enemy'}" @click="targetSide = 'Enemy'">
                        <span class="label">Enemy</span>
                    </button>
                </div>

            </div>
            <div class="search-list-results">
                <div v-for="buffSkill in filteredBuffList" class="search-list-item" @click="addBuffSkill(buffSkill.Skill)">
                    <div class="transferable-skill-icon me-2">
                        <img class="student-icon" :src="`/images/student/icon/${buffSkill.Skill.SourceCharacterId}.webp`">
                        <img class="skill-icon" :class="`bg-atk-${buffSkill.Skill.BulletType.toLowerCase()}`" :src="`/images/skill/${buffSkill.Skill.Icon}.webp`">
                    </div>
                    <div class="search-list-item-detail">
                        <span class="skill-name">
                            <span><fa v-if="buffSkill.Pinned" icon="thumbtack" class="me-1" />{{ buffSkill.Skill.Name }}</span>
                            <small class="ms-auto">{{ buffSkill.Skill.SourceCharacterName }} / {{ translate('SkillType', buffSkill.Skill.Type) }}</small>
                        </span>
                        <span class="skill-details">
                            <span class="me-1">Effects: </span>
                            <img v-for="effect in getEffects(buffSkill.Skill)"
                            class="inline-img"
                                :src="`/images/buff/${effect}.webp`">
                        </span>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- <Collapse v-model:show="userDefinePanel"> -->
        <!-- <div class="mb-3 large"> -->
        <div v-show="userDefinePanel" class="search-list-container">
            <div class="search-list p-2 large">
                <h5 class="mb-3 mt-2 px-2">
                    <fa icon="wrench" class="me-1" />
                    Add User Defined Buff
                </h5>
                <div class="d-flex gap-2 align-items-stretch mb-2 flex-wrap">
                    <button class="btn-pill" data-bs-toggle="dropdown" data-bs-auto-close="true">
                        <span class="d-flex align-items-center">
                            <inline-svg class="stat-icon-svg" :class="getStatIconClass(selectedUserDefineStat)" :src="`/images/staticon/svg/${getStatIconName(selectedUserDefineStat)}.svg`"></inline-svg>
                            {{ translate('Stat', selectedUserDefineStat) }}
                            <fa icon="caret-down" class="mx-2" />
                        </span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-start dropdown-menu-scroll-large" style="max-height: calc(40vh);">

                        <li v-for="stat in allModifiableStats">
                            <button class="dropdown-item dropdown-item-icon" :class="{active: stat == selectedUserDefineStat}" @click="selectedUserDefineStat = stat">
                                <inline-svg class="stat-icon-svg" :class="getStatIconClass(stat)" :src="`/images/staticon/svg/${getStatIconName(stat)}.svg`"></inline-svg>
                                {{ translate('Stat', stat) }}
                            </button>
                        </li>

                    </ul>
                    <div class="flex-fill"></div>
                    <div class="input-group w-auto">
                        <button class="btn-pill" @click="userDefineAmountNegative = !userDefineAmountNegative">
                            <div class="d-flex align-items-center justify-content-center ms-2 me-1" style="font-size: 18px; width: 12px;">
                                {{ userDefineAmountNegative ? '-' : '+' }}
                            </div>
                        </button>
                        <input
                        type="number"
                        :inputmode="userDefineAmountInputMode"
                        :step="userDefineAmountStep"
                        class="form-control px-3"
                        autocomplete="off"
                        v-model.number="userDefineAmount"
                        placeholder="Amount"
                        style="width: 180px;">
                        <button class="btn-pill" :class="{deactivated: !userDefineAmountCoefficient}" @click="switchAmountMode">
                            <span class="d-flex align-items-center ps-1 pe-2" style="font-size: 18px">
                                %
                            </span>
                        </button>
                    </div>

                </div>
                <div class="d-flex gap-2 align-items-stretch">
                    <input
                        type="text"
                        class="form-control w-auto flex-fill px-3"
                        autocomplete="off"
                        v-model="userDefineLabel"
                        placeholder="Label (Optional)">
                    <button class="btn-pill ms-auto" @click="addUserDefinedBuffSkill">
                        <span class="label">
                            <fa icon="plus" class="me-2" />
                            Add
                        </span>
                    </button>
                </div>
            </div>


        </div>
    <!-- </Collapse> -->

    
</div>


</template>

<style scoped lang="scss">

input.form-control {
    height: 40px;

    &::-webkit-inner-spin-button {
        appearance: none;
    }

    &.coefficient {
        padding-right: 40px !important;
        position: relative;

        &::after {
            background-color: #fff;
            display: inline-block;
            position: absolute;
            width: 30px;
            height: 30px;
            top: 0;
            right: 0;
            content: '%';
        }
    }
}

.large .btn-pill {
    height: 40px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.stat-icon-svg {
    width: 24px;
    min-width: 24px;
    padding: 1px;
    margin: 0 0.5rem;
}

.search-list-container {
    position: absolute;
    top: 48px;
    width: 100%;
}

</style>