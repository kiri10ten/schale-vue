<script setup>
import { computed } from 'vue';
import { translateUi } from '../../../composables/Localization';
import SkillTextPart from './SkillTextPart.vue';
import { distanceString } from '../../../composables/Utilities';

const buffTagType = {
    b: 'Buff',
    d: 'Debuff',
    c: 'CC',
    s: 'Special'
}

const props = defineProps({
    skill: Object,
    skillLevel: Number,
    bulletType: String,
    emphasiseChange: {
        type: Boolean,
        default: false
    },
    showHitCount: {
        type: Boolean,
        default: true
    }
});

// const parameterClass = computed(() => { return props.bulletType == null ? 'ba-col-emphasis' : `ba-col-${props.bulletType.toLowerCase()}`});

const textParameters = computed(() => {

    const level = props.skillLevel;
    const textParameters = [];
    const skillHits = {};

    props.skill.Effects?.filter(e => e.HitsParameter !== undefined).forEach(effect => {
        if (effect.HitFrams !== undefined) {
            skillHits[effect.HitsParameter] = [];
            if ("Hits" in effect) {
                effect.HitFrames.forEach(() => skillHits[effect.HitsParameter].push(...effect.Hits));
            } else {
                effect.HitFrames.forEach(() => skillHits[effect.HitsParameter].push(10000));
            }
        } else {
            skillHits[effect.HitsParameter] = effect.Hits;
        }
    })

    for (let i = 1; i <= props.skill.Parameters?.length; i++) {

        const parameterObj = {
            text: props.skill.Parameters[i-1][level-1],
            hits: null,
            class: props.bulletType == null ? 'ba-col-emphasis' : `ba-col-${props.bulletType.toLowerCase()}`
        }

        if (props.showHitCount && i in skillHits) {
            parameterObj.hits = getSkillHitsText(skillHits[i], props.skill.Parameters[i-1][level-1], props.bulletType.toLowerCase())
        }

        textParameters.push(parameterObj);
        
    }

    return textParameters;
})

const textParts = computed(() => {
    return props.skill.Desc.replace(/<[bdcs]:\w+>/g, (m) => `|${m}|`).replace(/<\?[0-9+]>/g, (m) => `|${m}|`).split('|').map(getPartObj);
})

function getPartObj(part) {
    let partType = 'text';
    let partContent = part.replace(/[0-9.]+(?:%|s|秒|초| วินาที)/g, (match) => {return `<b>${match}</b>`});
    partContent = part.replace(/<kb:(\d+)>/g, (match, p1) => {
        const knockbackEffect = props.skill.Effects.filter(e => e.Type == 'Knockback')[p1 - 1]
        return `<b>${distanceString(knockbackEffect.Scale[props.skillLevel - 1] * 2, true)}</b>`
    });

    const numberedParam = part.match(/^<\?([0-9]+)>$/);
    if (numberedParam && numberedParam[1] - 1 < textParameters.value.length) {
        partType = 'param';
        partContent = textParameters.value[numberedParam[1] - 1];

        const nestedBuffTags = partContent.text.match(/<[bdcs]:\w+>/);

        if (nestedBuffTags) {

            partType = 'part';

            const innerTextParts = partContent.text.replace(/<[bdcs]:\w+>/g, (m) => `|${m}|`).split('|').map(getPartObj);
            partContent = { class: partContent.class, parts: innerTextParts };

        }

    }

    const buffTag = part.match(/^<([bdcs]):(\w+)>$/);
    if (buffTag) {

        partType = 'buff';
        partContent = {
            type: buffTagType[buffTag[1]],
            name: buffTag[2]
        }

    }

    return {type: partType, content: partContent}
}

function getSkillHitsText(damageDist, totalDamage, type) {
    let hits = {};
    let hitsText = '';
    totalDamage = parseFloat(totalDamage.replace('%', ''));
    damageDist.forEach((hit) => {
        hit = parseFloat(((hit / 10000) * totalDamage).toFixed(1)) + '%';
        hits[hit] = hits[hit] ? hits[hit]+1 : 1;
    })
    Object.keys(hits).forEach((hit) => {
        hitsText += `${hitsText == '' ? '' : '\n'}<span class='ba-col-${type}'>${hit}</span> <b>&times;${hits[hit]}</b>`;
    })
    return translateUi('skill_hits_tooltip', `<b>${damageDist.length}</b>`) + `\n<small>${hitsText}</small>`;
}

</script>
<template>
    <p>
        <SkillTextPart v-for="part in textParts" :part="part" />
    </p>
</template>

