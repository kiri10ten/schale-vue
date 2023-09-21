import { ref } from 'vue';
import { useLocalizationDataStore } from '../stores/LocalizationDataStore';

export function translate(group, key, ...replacements) {
    const localizations = useLocalizationDataStore().data
    return localizations[group][key]?.replace(/\{([0-9]+)\}/g, (match, p1) => (p1 < replacements.length) ? replacements[p1] : '');   
}

export function translateUi(key, ...replacements) {
    return translate('ui', key, ...replacements);
}