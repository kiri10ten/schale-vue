import { Tooltip } from "bootstrap";

export function getBasicTooltip(text) {
    return `
    <span class='ba-tooltip'>
        <div class='ba-tooltip-header m-0'>
            <div class='d-flex justify-content-center w-100'>
                <div class='ba-tooltip-title text-center fs-6'>${text}</div>
            </div>
        </div>
    </span>`
}

export function getObjectTooltip({title, subtitle = null, icon = null, rarity = null, body = null, iconSize: [iconHeight, iconWidth] = [50, 50], iconClass = ''}) {
    let html =  `<span class='ba-tooltip'>`

    html += `<div class='ba-tooltip-header'>`
    if (icon != null) {
        html += `<div class='ba-tooltip-img'><img class='${iconClass}' src='${icon}' width='${iconWidth}' height='${iconHeight}'></div>`
    }
    html += `<div class='flex-fill d-flex flex-column'>
    <div class='flex-fill d-flex flex-column justify-content-center'>
    <div class='ba-tooltip-title'>${title.replace( /\"/g, "&quot;")}</div></div>`
    
    if (subtitle != null || rarity != null) {
        html += `<div class='d-flex align-items-center mt-auto'>`
        html += subtitle != null ? `<span class='ba-tooltip-subtitle flex-fill'>${subtitle}</span>` : ''
        html += rarity != null ? `<span class='ba-tooltip-rarity text-bold'>${rarity}</span>` : ''
        html += '</div>'
    }

    html += '</div></div>'
    
    if (body != null && body != "") {
        html += `<div class='ba-tooltip-body'>${body.replace( /\"/g, "&quot;")}</div>`
    }
    html += '</span>'
    return html
}

export function bindTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((el) => {
        return new Tooltip(el, {
            html: true,
        })
    });
}

