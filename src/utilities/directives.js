import { Tooltip } from 'bootstrap'
import { getBasicTooltip } from '../composables/Tooltips';

export function tooltip(el, binding) {

    new Tooltip(el, {
        title: getBasicTooltip(binding.value),
        html: true,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>'
    });
    
}