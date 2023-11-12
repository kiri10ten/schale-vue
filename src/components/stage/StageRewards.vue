<script setup>
import { computed, ref } from 'vue';
import { translateUi } from '../../composables/Localization';
import { abbreviateNumber } from '../../composables/Utilities';
import ItemIcon from '../common/ItemIcon.vue';

let slideTimer;
const slide = ref(0);

const props = defineProps({
    rewards: {
        type: Array,
        required: true
    }
})

const renderRewards = computed(() => {

    const rewards = [];

    for (const reward of props.rewards) {

        let primaryLabel;
        let secondaryLabel;
        if (reward.Chance > 0) {
            primaryLabel = `${+(reward.Chance * 100).toFixed(2)}%`;
        }

        if ((reward.Amount ?? 1) > 0) {
            const amount =  `×${abbreviateNumber(reward.Amount ?? 1)}`;
            if (primaryLabel && reward.Amount > 1) {
                secondaryLabel = amount;
            } else if (primaryLabel === undefined) {
                primaryLabel = amount;
            }
        }

        if (reward.AmountMin > 0 && reward.AmountMax > reward.AmountMin) {
            const amount = `×${abbreviateNumber(reward.AmountMin)}~${abbreviateNumber(reward.AmountMax)}`;
            if (primaryLabel) {
                secondaryLabel = amount;
            } else {
                primaryLabel = amount;
            }
        }

        if (reward.RewardType == 'FirstClear') {
            secondaryLabel = translateUi("stage_reward_firstclear");
        } else if (reward.RewardType == 'ThreeStar') {
            secondaryLabel = '★★★';
        }

        rewards.push({
            itemType: reward.Type,
            itemId: reward.Id,
            primaryLabel: primaryLabel,
            secondaryLabel: secondaryLabel
        })

    }

    
    if (slideTimer) {
        slide.value = 0;
        clearInterval(slideTimer);
    }

    slideTimer = setInterval(() => slide.value++, 1000);
    return rewards;

})

</script>

<template>

    <div class="item-icon-list">
        <ItemIcon v-for="reward in renderRewards" v-bind="reward" :slide="slide"/>
    </div>


</template>