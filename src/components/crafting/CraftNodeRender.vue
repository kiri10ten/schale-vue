<script setup>
import { sum } from 'lodash';
import { getCraftNodeById, getCraftingTotalWeight } from '../../composables/Crafting';
import { translate, translateUi } from '../../composables/Localization';
import { regionSettings } from '../../composables/RegionSettings';
import { useSettingsStore } from '../../stores/SettingsStore';
import { computed, ref } from 'vue';
import ItemIcon from '../common/ItemIcon.vue';
import StageRewards from '../stage/StageRewards.vue';
import { getGachaGroupById } from '../../composables/GachaGroup';
import BooleanButton from '../common/BooleanButton.vue';

const props = defineProps({
    craftNode: {
        type: Object,
        required: true,
        default(rawProps) {
            return getCraftNodeById(1);
        }
    }
});

let slideTimer;
const slide = ref(0);
const simpleView = ref(true);

const settingsStore = useSettingsStore();

const nodeGroups = computed(() => props.craftNode[`Groups${regionSettings.value.ServerName}`] ?? props.craftNode.Groups);

const totalWeight = computed(() => sum(nodeGroups.value.map(g => g.Weight)));

const rewardGroups = computed(() => {

    const groups = [];

    for (const group of nodeGroups.value) {

        const gachaGroup = getGachaGroupById(group.GroupId);
        const groupItems = gachaGroup[`Items${regionSettings.value.ServerName}`] ?? gachaGroup.Items;
        if (/*nodeGroups.value.length == 1 || */!simpleView.value) {
            for (const groupItem of groupItems) {
                groups.push({
                    Type: groupItem.Type,
                    Id: groupItem.Id,
                    Chance: (group.Weight / totalWeight.value) * groupItem.Chance,
                    AmountMin: groupItem.AmountMin,
                    AmountMax: groupItem.AmountMax,
                })
            }
        } else {
            if (groupItems.length == 1) {
                groups.push({
                    Type: groupItems[0].Type,
                    Id: groupItems[0].Id,
                    Chance: (group.Weight / totalWeight.value),
                    AmountMin: groupItems[0].AmountMin,
                    AmountMax: groupItems[0].AmountMax,
                })
            } else {
                groups.push({
                    Type: 'GachaGroup',
                    Id: group.GroupId,
                    Chance: group.Weight / totalWeight.value,
                })
            }
        }

    }

    if (slideTimer) {
        slide.value = 0;
        clearInterval(slideTimer);
    }

    slideTimer = setInterval(() => slide.value++, 1000);

    return groups;

})

const appearChance = computed(() => {
    return `${(props.craftNode[`Chance${regionSettings.value.ServerName}`] * 100).toFixed(2)}%`;
})

const baseChance = computed(() => {
    return `${(((props.craftNode[`Property${regionSettings.value.ServerName}`] ?? props.craftNode.Property) / getCraftingTotalWeight(props.craftNode.Tier)) * 100).toFixed(2)}%`
})

</script>

<template>
<div class="card p-2">
    <div class="card-header">
        <div class="d-flex flex-row align-items-top px-1 pt-2">
            <div class="flex-grow-1">
                <div>
                    <h2 class="title-text mb-2">
                        {{ craftNode[`Name${settingsStore.languageProp}`] ?? craftNode.NameJp }}
                    </h2>
                    <h5 class="text-italic" v-if="settingsStore.settings.server == 0 && settingsStore.languageProp != 'Jp'">{{ craftNode.NameJp }}</h5>
                    <div class="d-flex gap-2 flex-wrap mt-3">
                        <h5 class="mb-0" id="ba-item-type">{{ translate('NodeTier', craftNode.Tier) }}</h5>
                        <!-- <span class="ba-info-pill-s bg-theme ms-2">
                            <span class="label">{{ translate("NodeQuality", craftNode.Quality) }}</span>
                        </span> -->
                        <template v-if="settingsStore.settings.showDeveloperProps">
                            <div class="ba-info-pill-s bg-theme px-2 text-muted ms-auto">
                                {{ craftNode.Id }}
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card-body d-flex flex-column gap-3">
        <div class="craft-details d-flex gap-2">
            <div class="p-2 ba-panel d-flex">
                <div class="craft-image">
                    <img class="node-icon" :class="{rare: craftNode.Quality == 2}" :src="`/images/craftnode/${craftNode.Icon}.png`">
                    <img class="node-border" :src="`/images/craftnode/Node_Border.png`">
                </div>
            </div>
            <div class="d-flex flex-fill flex-column gap-2">
                <div class="ba-panel">
                    <p id="ba-item-description" class="p-2 mb-0">{{ craftNode[`Desc${settingsStore.languageProp}`] ?? craftNode.DescJp }}</p>
                </div>
                <div class="ba-panel">
                    <div class="row g-0">
                        <div class="col-6 p-2">
                            <div class="d-flex align-items-center justify-content-between">
                                <span>{{ translateUi('base_chance') }}</span>
                                <span class="ms-2 text-bold text-end">{{ baseChance }}</span>
                            </div>
                        </div>
                        <div class="col-6 p-2">
                            <div class="d-flex align-items-center justify-content-between">
                                <span>{{ translateUi('appearance_rate') }}<fa icon="circle-question" class="help ms-2" v-tooltip="translateUi('appearance_rate_help')" /></span>
                                <span class="ms-2 text-bold text-end">{{ appearChance }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div>
            <div class="d-flex align-items-center gap-2 mb-2">
                <h5 class="text-bold mb-0">{{ translateUi('craft_rewards') }}</h5>
                <BooleanButton v-model="simpleView" class="ms-auto">
                    Grouped View
                </BooleanButton>
            </div>
            
            <div class="ba-panel p-2">
                <StageRewards :rewards="rewardGroups" />
            </div>
        </div>
        
    </div>
</div>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.card {
    
    padding: 0.5rem;
    margin-bottom: 1rem;

    @include md-down {
        border-radius: 0px;
        padding: 0.5rem 0;
        margin-bottom: 0;
    }
}

.craft-details {

    align-items: start;

    @include md-down {
        flex-direction: column;
        align-items: stretch;


    }

    .craft-image {

        position: relative;
        margin: auto;

        img {
            height: 100px;
        }

        img.node-border {
            position: absolute;
            height: 100px;
            left: 0;
            top: 0;
        }

    }
}

</style>