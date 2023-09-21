<script setup>
import BuffTag from './BuffTag.vue';

defineProps({
    part: Object
});

</script>

<template>
    <span v-if="part.type == 'text'" v-html="part.content"></span>

    <template v-if="part.type == 'param'">
        <span v-if="part.content.hits !== null" v-tooltip="part.content.hits" :class="[part.content.class, 'skill-hitinfo']">{{ part.content.text }}</span>
        <span v-if="part.content.hits === null" :class="part.content.class">{{ part.content.text }}</span>
    </template>

    <BuffTag v-if="part.type == 'buff'" :type="part.content.type" :name="part.content.name" />

    <span v-if="part.type == 'part'" :class="part.content.class">
        <SkillTextPart v-for="innerpart in part.content.parts" :part="innerpart" />
    </span>
    
</template>