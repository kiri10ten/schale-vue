import { getBasicTooltip } from "./Tooltips";

export function getSkillText(skill, level, {renderBuffs = true, bulletType = null, emphasiseChange = false, renderSkillHits = true}) {
    
    let result = skill.Desc;
    const emphasisRegex = /[0-9.]+(?:%|s|秒|초| วินาที)/g;
 
    result = result.replace(emphasisRegex, function(match) {return `<strong>${match}</strong>`});

    const parameterClass = bulletType == null ? 'ba-col-emphasis' : `ba-col-${bulletType.toLowerCase()}`;

    let skillHits = {}
    if ("Effects" in skill) {
        skill.Effects.filter(e => "HitsParameter" in e).forEach(effect => {
            if ("HitFrames" in effect) {
                skillHits[effect.HitsParameter] = []
                if ("Hits" in effect) {
                    effect.HitFrames.forEach(() => skillHits[effect.HitsParameter].push(...effect.Hits));
                } else {
                    effect.HitFrames.forEach(() => skillHits[effect.HitsParameter].push(10000));
                }
                
            } else {
                skillHits[effect.HitsParameter] = effect.Hits;
            }
        })
    }

    if ("Parameters" in skill) {
        for (let i = 1; i <= skill.Parameters.length; i++) {
            while (result.includes(`<?${i}>`)) {
                if (emphasiseChange) {
                    //only emphasise parameters once they change
                    if ((level == 1 && skill.Parameters[i-1][level-1] != skill.Parameters[i-1][level]) || (level > 1 && skill.Parameters[i-1][level-1] != skill.Parameters[i-1][level-2])) {
                        result = result.replace(`<?${i}>`, `<span class="${parameterClass}">${skill.Parameters[i-1][level-1]}</span>`)
                    } else {
                        result = result.replace(`<?${i}>`, skill.Parameters[i-1][level-1].replace(emphasisRegex, function(match) {return `<strong>${match}</strong>`}))   
                    }
                } else {
                    if (renderSkillHits && i in skillHits) {
                        result = result.replace(`<?${i}>`, `<span class="${parameterClass} skill-hitinfo" data-bs-toggle="tooltip" data-bs-placement="top" title="${getBasicTooltip(getSkillHitsText(skillHits[i], skill.Parameters[i-1][level-1], bulletType.toLowerCase()))}">${skill.Parameters[i-1][level-1]}</span>`)

                    } else {
                        result = result.replace(`<?${i}>`, `<span class="${parameterClass}">${skill.Parameters[i-1][level-1]}</span>`)
                    }
                }
            }
        }
    }

    result = replaceBuffPlaceholders(result, renderBuffs)

    return result
}

export function replaceBuffPlaceholders(text, renderBuffs = true) {
    let result = text
    const buffTypes = ['Buff', 'Debuff', 'CC', 'Special']
    buffTypes.forEach(type => {
        const buffRegex = new RegExp(`<${type.slice(0,1).toLowerCase()}:(\\w+)>`, 'g')
        if (renderBuffs) {
            result = result.replace(buffRegex, function(match, capture) {
                return getBuffTag(type, capture, {tooltip: true})
            })
        } else {
            result = result.replace(buffRegex, function(match, capture) {
                const buffName = type + '_' + capture
                return `<b>${getLocalizedString('BuffName', buffName)}</b>`
            })
        }

    })
    return result
}

function getBuffTag(type, name, {tooltip, overrideName = null}) {
    const buffName = `${type}_${name}`
    return `<span class="ba-skill-${type.toLowerCase()}" ${tooltip ? `data-bs-toggle="tooltip" data-bs-placement="top" title="${getRichTooltip(`images/buff/${buffName}.webp`, getLocalizedString('BuffNameLong', buffName), getLocalizedString('BuffType', type), null, getLocalizedString('BuffTooltip', buffName), 30)}"` : ''}><img class=\"buff-icon\" src=\"images/buff/${buffName}.webp\"><span class="buff-label">${overrideName !== null ? overrideName : getLocalizedString('BuffName', buffName)}</span></span>`
}