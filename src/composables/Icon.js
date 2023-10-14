
export function getStatIconName(stat) {
    const statName = stat.split('_')[0]
    if (statName.startsWith('Enhance')) {
        return 'EnhanceRate';
    } else if (statName.startsWith('Extend')) {
        return 'ExtendDuration';
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