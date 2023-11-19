<script setup>
import BuffTag from './BuffTag.vue';

defineProps({
    part: Object,
    bulletType: String
});

</script>

<template>
    <span v-if="part.type == 'text'" v-html="part.content"></span>

    <template v-if="part.type == 'param'">
        <span v-if="part.content.hits !== null"
            v-tooltip="part.content.hits"
            class="no-wrap" :class="[part.content.class, 'skill-dmg']"
            :style="{backgroundColor: `var(--col-textbg-${bulletType})`, color: `var(--col-text-${bulletType.toLowerCase()})`}">
            <template v-if="part.content.blockable !== null">
                <img v-if="part.content.blockable == 0" class="block-icon" src="/images/ui/Cover_NoBlock.png">
                <img v-else-if="part.content.blockable == 1" class="block-icon" src="/images/ui/Cover_Block.png">
                <img v-else-if="part.content.blockable == 2" class="block-icon" src="/images/ui/Cover_PartialBlock.png">
            </template>
            <span v-html="part.content.text"></span>
        </span>
        <span v-if="part.content.hits === null" :class="part.content.class" v-html="part.content.text"></span>

    </template>

    <BuffTag v-if="part.type == 'buff'" :name="part.content.name" :label="part.content.label" />

    <span v-if="part.type == 'part'" :class="part.content.class">
        <SkillTextPart v-for="innerpart in part.content.parts" :part="innerpart" />
    </span>
    
</template>

<style scoped lang="scss">
@import '../../../styles/_mixins.scss';

.skill-dmg {
    display: inline-flex;
    align-items: center;
    vertical-align: text-bottom;

    line-height: 22px;
    border-radius: 1rem;
    padding: 0 6px;
    white-space: nowrap;
    cursor: default;
    transition: background-color ease var(--var-animation-duration), color ease var(--var-animation-duration);

    .block-icon {
        display: inline;
        height: 20px;
        width: auto;
        margin-right: 2px
    }
}
</style>