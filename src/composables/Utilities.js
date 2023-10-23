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

export function setNoBackground() {
    const settings = useSettingsStore().settings;
    document.body.classList.toggle('no-background', settings.backgrounds == false);
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

export function getDuration(seconds) {
    const result = {
        seconds: 0,
        minutes: 0,
        hours: 0,
        days: 0
    }

    if (seconds < 0) {
        return result;
    }

    let totalSeconds = seconds;

    result.days = Math.floor(totalSeconds/86400);
    totalSeconds -= result.days*86400;

    result.hours = Math.floor(totalSeconds/3600);
    totalSeconds -= result.hours*3600;

    result.minutes = Math.floor(totalSeconds/60);
    totalSeconds -= result.minutes*60;

    result.seconds = totalSeconds;

    return result;
}

export function distanceString(value, longUnit = false) {
    const settings = useSettingsStore().settings;

    if (settings.distanceUnit == 'metric') {
        return `${value / 100}m`
    } else {
        return longUnit ? value.toLocaleString() + ' units' : value.toLocaleString();
    }
}

export function framesString(value) {
    const settings = useSettingsStore().settings;

    if (settings.durationUnit == 'seconds') {
        return translateUi('time_seconds', +(value / 30).toFixed(2)); 
    } else {
        return `${value}f`;
    }
}