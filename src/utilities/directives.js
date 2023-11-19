import { Tooltip } from 'bootstrap'
import { getBasicTooltip } from '../composables/Tooltips';

export const tooltip = {

    mounted(el, binding) {
        new Tooltip(el, {
            title: getBasicTooltip(binding.value),
            html: true,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>'
        });
    },
    updated(el, binding) {
        const bsTooltip = Tooltip.getInstance(el);
        if (bsTooltip) {
            bsTooltip.dispose();
        }
        new Tooltip(el, {
            title: getBasicTooltip(binding.value),
            html: true,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>'
        });
    },
    unmounted(el) {
        const bsTooltip = Tooltip.getInstance(el);
        if (bsTooltip) {
            bsTooltip.dispose();
        }
    }
}