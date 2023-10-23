<script setup>
import { useSettingsStore } from '../../stores/SettingsStore';

const props = defineProps({
    item: Object,
    useReplace: {
        type: Boolean,
        default: false
    },
    noLink: Boolean,
    badge: String,
    width: Number,
    height: Number,
})

const settings = useSettingsStore().settings;

</script>

<template>
    <component :is="noLink ? 'div' : 'RouterLink'" :to="{name: item.Type.toLowerCase() + 'view', params: { [item.Type.toLowerCase() + 'id']: item.Id }}" class="selection-grid-card card-items" :replace="useReplace">
        <div class="card-img" :class="`ba-item-${item.Rarity.toLowerCase()}`">
            <img :key="item.Type + item.Id" :src="`/images/${item.Type}/icon/${item.Icon}.webp`" loading="lazy">
        </div>
        <div v-if="item.Type == 'furniture' && item.Interaction" class="card-badge furniture-interaction"><img :src="'/images/ui/Cafe_Icon_Interaction.png'"></div>
        <div v-if="item.Type == 'equipment' && item.Tier > 0" class="card-badge equipment-tier">T{{item.Tier}}</div>
        <div v-if="badge" class="card-badge item-badge top-right">{{badge}}</div>
        <div class="card-label">
            <span class="label-text smalltext">{{item.Name}}</span>
        </div>
    </component>
</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.selection-grid-card {
    display: inline-block;
    font-size: 0px;

    --var-grid-card-width: v-bind('width + "px"');
    --var-grid-card-height: v-bind('height + "px"');

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