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
    const skillRawScale = {}

    props.skill.Effects?.filter(e => e.HitsParameter !== undefined).forEach(effect => {
        if (effect.Hits) {
            skillHits[effect.HitsParameter] = [...effect.Hits]
            skillRawScale[effect.HitsParameter] = [...effect.Scale]
        } else {
            skillHits[effect.HitsParameter] = [10000]
            skillRawScale[effect.HitsParameter] = [...effect.Scale]
        }
    })

    for (let i = 1; i <= props.skill.Parameters?.length; i++) {

        const parameterObj = {
            text: props.skill.Parameters[i-1][level-1],
            hits: null,
            class: props.bulletType == null ? 'ba-col-emphasis' : `ba-col-${props.bulletType.toLowerCase()}`
        }

        if (props.showHitCount && i in skillHits) {
            parameterObj.hits = getSkillHitsText(skillHits[i], skillRawScale[i][level - 1], props.bulletType.toLowerCase())
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
    partContent = partContent.replace(/<kb:(\d+)>/g, (match, p1) => {
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
    const hitsArray = [];
    let hitsText = '';

    damageDist.forEach((dist) => {
        const hitAmount = +((dist / 10000) * totalDamage).toFixed(0)
        if (hitsArray.length && hitsArray[hitsArray.length - 1][0] == hitAmount) {
            hitsArray[hitsArray.length - 1][1] += 1;
        } else {
            hitsArray.push([hitAmount, 1]);
        }
    })

    for (const [hitAmount, times] of hitsArray) {
        hitsText += `<div class="d-flex w-100 justify-content-between"><small class='ba-col-${type}'>${(hitAmount / 100)}%</small><small class="ms-3 text-bold">&times;${times}</small></div>`;
    }

    return `<div><b>${damageDist.length}</b> hits</div><div class="d-flex w-100 flex-column align-items-center">${hitsText}</div>`;
}

</script>
<template>
    <p>
        <SkillTextPart v-for="part in textParts" :part="part" />
    </p>
</template>

