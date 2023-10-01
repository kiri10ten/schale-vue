import { computed } from "vue";
import { useSettingsStore } from "../stores/SettingsStore";
import { translate, translateUi } from "./Localization";

export function setBackground(src) {
    const newBackground = new Image();
    newBackground.onload = function(){
        document.getElementById('ba-background').style.backgroundImage = `url('${newBackground.src}')`;
    }
    newBackground.src = `/images/background/${src}`;
}

export function setTheme() {
    const settings = useSettingsStore().settings;

    switch (settings.theme)
    {
        case 'auto':
        {
            document.body.classList.toggle('theme-dark', window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
            break;
        }
        case 'dark':
        {
            document.body.classList.add('theme-dark');
            break;
        }
        case 'light':
        {
            document.body.classList.remove('theme-dark');
            break;
        }
    }
    
}

export function setHighContrast() {
    const settings = useSettingsStore().settings;
    document.body.classList.toggle('high-contrast', settings.highcontrast);
}

export function abbreviateNumber(number) {
    let result = number, divisions = 0
    const suffix = ['', 'K', 'M', 'B', 'T']
    while (result >= 1000) {
        divisions++;
        result /= 1000;
    }
    return result + suffix[divisions]
}

export function extractNumber(string) {
    let result = parseInt(string.replace(/[^0-9]/g));
    return isNaN(result) ? 0 : result;
}