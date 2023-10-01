import { useDataStore } from '../stores/DataStore';

export function translate(group, key, ...replacements) {
    const localizations = useDataStore().localization.data;
    return localizations[group][''+key]?.replace(/\{([0-9]+)\}/g, (match, p1) => (p1 < replacements.length) ? replacements[p1] : '') ?? `[${group}:${key}]`;   
}

export function translateUi(key, ...replacements) {
    return translate('ui', key, ...replacements);
}