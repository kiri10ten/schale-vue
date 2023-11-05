
export function getStatIconName(stat) {
    const statName = stat.split('_')[0]
    if (statName.startsWith('Enhance')) {
        if (statName.includes('Armor') || statName.includes('Unarmed')) {
            return 'EnhanceArmorRate';
        } else {
            return 'EnhanceRate';
        }
        
    } else if (statName.startsWith('Extend')) {
        return 'ExtendDuration';
    }  else if (statName == 'StabilityRate') {
        return 'StabilityPoint';
    } else {
        return statName;
    }
}

export function getStatIconClass(stat) {
    const statName = stat.split('_')[0]
    if (statName.startsWith('Enhance')) {
        return statName.replace('Enhance', '').replace('Rate', '-rate').toLowerCase();
    } else if (statName.startsWith('Extend')) {
        return statName.replace('Extend', '').replace('Duration', '-duration').toLowerCase();
    } else {
        return null;
    }
}

export function getSchoolIconName(school) {
    if (school == 'Sakugawa') {
        return 'ETC';
    } else {
        return school;
    }
}