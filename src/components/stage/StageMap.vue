<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMixedTypeGradient, numberToLetter } from '../../composables/Utilities';
import { getEnemyById } from '../../composables/Enemies';
import { useElementBounding } from '@vueuse/core';

const props = defineProps({
    stage: {
        type: Object,
        required: true
    },
    selectedUnit: Number
})

const emit = defineEmits(['selectUnit']);

const container = ref(null);
const canvas = ref(null);

const zoomLevel = ref(0);
const maxZoomLevel = 3;

const scrolling = ref(false);
const scrollStart = {top: 0, left: 0, x: 0, y: 0}

const containerBounding = useElementBounding(container);
const canvasBounding = useElementBounding(canvas);

const scrollable = computed(() => {
    return canvasBounding.width.value > containerBounding.width.value || canvasBounding.height.value > containerBounding.height.value
})

const tileWidth = 98;
const tileHeight = 80;

const mapBounds = computed(() => {
    const bounds = {
        xMin: null,
        xMax: null,
        yMin: null,
        yMax: null,
        offsetLeft: null,
        offsetRight: null,
        offsetTop: 55,
    }

    for (const tile of props.stage.HexaMap) {
        bounds.xMin = bounds.xMin == null ? tile.Pos[0] : Math.min(bounds.xMin, tile.Pos[0]);
        bounds.xMax = bounds.xMax == null ? tile.Pos[0] : Math.max(bounds.xMax, tile.Pos[0]);
        bounds.yMin = bounds.yMin == null ? tile.Pos[1] : Math.min(bounds.yMin, tile.Pos[1]);
        bounds.yMax = bounds.yMax == null ? tile.Pos[1] : Math.max(bounds.yMax, tile.Pos[1]);

        const tileOffsetLeft = (tile.Pos[0] * tileWidth) + (tile.Pos[1] * tileWidth * 0.5);
        const tileOffsetRight = tileWidth + tileOffsetLeft;

        bounds.offsetLeft = bounds.offsetLeft == null ? tileOffsetLeft : Math.min(bounds.offsetLeft, tileOffsetLeft);
        bounds.offsetRight = bounds.offsetRight == null ? tileOffsetRight : Math.max(bounds.offsetRight, tileOffsetRight);
    }

    //Translate bounds to normalise the top-left to (0, 0)
    const xOffset = (bounds.xMin * tileWidth) + (bounds.yMin * tileWidth * 0.5);
    bounds.offsetLeft -= xOffset;
    bounds.offsetRight -= xOffset;

    //console.log('MapBounds', bounds)
    return bounds;
})

const containerStyle = computed(() => {
    return {
        width: `${mapBounds.value.offsetRight - mapBounds.value.offsetLeft + 32}px`,
        height: `${mapBounds.value.offsetTop + 16 + tileWidth + (mapBounds.value.yMax - mapBounds.value.yMin) * (Math.sqrt(Math.pow(tileHeight / 2, 2) * 3))}px`,
        transform: `scale(${1 - (zoomLevel.value * 0.15)})`,
        transformOrigin: 'center center',
    }
})

const tilePairs = computed(() => {
    const pairs = [];
    const triggerTileTypes = ['spawn', 'remove']

    for (const [i, tile] of props.stage.HexaMap.entries()) {
        if (tile.Trigger >= 0 && triggerTileTypes.includes(props.stage.HexaMap[tile.Trigger].Type)) {
            pairs.push([tile.Trigger, i])
        }
    }

    return pairs;
})

const renderTiles = computed(() => {
    const renderTiles = [];
    
    for (const [i, tile] of props.stage.HexaMap.entries()) {

        const renderTile = {}

        renderTile.pair = tilePairs.value.findIndex((pair) => pair.includes(i));
        
        const xNormal = tile.Pos[0] - mapBounds.value.xMin;
        const yNormal = tile.Pos[1] - mapBounds.value.yMin;

        renderTile.style = {
            left: `${xNormal * tileWidth + (yNormal * tileWidth * 0.5) - mapBounds.value.offsetLeft + 16}px`,
            top: `${yNormal * Math.sqrt(Math.pow(tileHeight / 2, 2) * 3) + mapBounds.value.offsetTop}px`
        }

        renderTile.zIndex = yNormal;

        if (tile.Type == 'disposable' && tile.Trigger) {
            if (props.stage.HexaMap[tile.Trigger].Type == 'spawn') {
                renderTile.hidden = true;
            }
        }

        if (tile.Item) {
            renderTile.item = tile.Item;
        }

        renderTile.start = (tile.Start == true);
        renderTile.icon = `Tile_${tile.Type ?? 'default'}`;

        if (tile.Formation) {
            const formation = props.stage.Formations.find(f => f.Id == tile.Formation);

            const armorTypes = [];

            for (const enemyId of formation.EnemyList) {
                const enemy = getEnemyById(enemyId);
                if (enemy.SquadType != 'Support' && armorTypes.indexOf(enemy.ArmorType) == -1) {
                    armorTypes.push(enemy.ArmorType);
                }
            }

            renderTile.style.cursor = 'pointer';
            renderTile.formation = {
                id: tile.Formation,
                icon: formation.MapIcon,
                grade: formation.UnitGrade,
                zIndex: 100 + yNormal,
                moveType: formation.MoveType,
                armorTypesBG: getMixedTypeGradient(armorTypes)
            }
        }


        renderTiles.push(renderTile);

    }

    return renderTiles;
})

onMounted(() => {
    container.value.addEventListener('mousedown', (e) => {
        scrolling.value = true;
        scrollStart.left = container.value.scrollLeft;
        scrollStart.top = container.value.scrollTop;
        scrollStart.x = e.clientX;
        scrollStart.y = e.clientY;
    });

    container.value.addEventListener('mousemove', (e) => {
        if (scrolling.value) {
            container.value.scrollLeft = scrollStart.left - (e.clientX - scrollStart.x)
            container.value.scrollTop = scrollStart.top - (e.clientY - scrollStart.y)
        }
        e.preventDefault();
    });

    container.value.addEventListener('mouseleave', (e) => {
        scrolling.value = false;
    });

    container.value.addEventListener('mouseup', (e) => {
        scrolling.value = false;
    });
})

</script>

<template>

<div class="stage-map-container" :class="{scrollable: scrollable, scrolling: scrolling}" ref="container">
    <div class="map-controls d-flex gap-1">
        <button class="btn-pill btn-circle" :class="{disabled: zoomLevel == 0}" @click="zoomLevel = Math.max(zoomLevel - 1, 0)">
            <span class="label">
                <fa icon="magnifying-glass-plus" />
            </span>
        </button>
        <button class="btn-pill btn-circle" :class="{disabled: zoomLevel == maxZoomLevel}" @click="zoomLevel = Math.min(zoomLevel + 1, maxZoomLevel)">
            <span class="label">
                <fa icon="magnifying-glass-minus" />
            </span>
        </button>
    </div>
    <div class="stage-map-canvas" :style="containerStyle" ref="canvas">
        <div v-for="(tile, index) in renderTiles"
            class="stage-map-tile"
            :class="{selected: tile.formation && tile.formation?.id == selectedUnit}"
            :style="tile.style"
            :key="`${stage.Id}_${index}`"
            v-on="tile.formation ? {click: () => emit('selectUnit', tile.formation?.id)} : {}">
            <img class="tile-icon" :class="{'tile-hidden': tile.hidden}" :style="{zIndex: tile.zIndex}" :src="`/images/tile/${tile.icon}.png`" >
            <img v-if="tile.start" class="start-tile" src="/images/ui/Image_Campaign_Start.png">
            <img v-if="tile.item" class="tile-item" :style="{zIndex: 100 + tile.zIndex}" :src="`/images/tile/Item_${tile.item}.png`">
            <template v-if="tile.formation">
                <img class="stage-map-enemy" :src="`/images/enemy/${tile.formation.icon}.webp`" :style="{zIndex: tile.formation.zIndex}">
                <span class="formation-grade">
                    <img v-if="tile.formation.grade == 'Boss'" class="formation-boss" :src="`/images/ui/Image_Campaign_Boss.png`">
                    <span v-else class="grade">
                        RANK<img :src="`/images/ui/EnemyRank_${tile.formation.grade}.png`">
                    </span>
                </span>
            </template>
            <div v-if="tile.formation || tile.pair > -1" class="formation-info">
                <span v-if="tile.pair > -1" class="tile-pair" :class="`pair-${tile.pair % 5}`">
                    <span class="font-nexon">{{ numberToLetter(tile.pair + 1) }}</span>
                    <!-- <fa :icon="pairSymbol[tile.pair]" /> -->
                </span>
                <span v-if="tile.formation" class="icon-type" :style="{background: tile.formation.armorTypesBG}"><img src="/images/ui/Type_Defense_s.png" height="14"></span>
                <span v-if="tile.formation?.moveType == 'Guard'" class="move-type guard">
                    <fa icon="triangle-exclamation"></fa>
                </span>
                <span v-if="tile.formation?.moveType == 'Pursuit'" class="move-type pursuit">
                    <fa icon="angles-left"></fa>
                </span>
            </div>
        </div>
    </div>
</div>

</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.stage-map-tile {

    width: 96px;
    height: 96px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;

    &.selected .tile-icon {
        filter: brightness(0.5);
    }

    .tile-icon {
        position: absolute;
        width: 96px;
        height: 96px;

        &.tile-hidden {
            opacity: 0.5;
        }
    }

    .start-tile {
        position: absolute;
        bottom: 40px;
        z-index: 5000;
        width: auto;
        height: 28px;
    }

    .tile-item {
        position: absolute;
        bottom: 30px;
        z-index: 5000;
        width: 64px;
        height: auto;
    }

    .stage-map-enemy {
        width: 120px;
        height: 120px;
        position: absolute;
        left: -10px;
        bottom: 25px;
        opacity: 1;
        pointer-events: none;
        @include unselectable;
        @include transition(transform, filter);
    }

    .formation-info {
        position: absolute;
        bottom: 16px;
        z-index: 5000;
        font-size: 18px;
        color: #fff;
        //height: 26px;
        padding: 2px;
        gap: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--col-bg-imglabel);
        @include circular;
        @include unselectable;

        .tile-pair {
            font-size: 16px;
            line-height: 16px;
            color: #fff;
            height: 20px;
            width: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--col-bg-imglabel);
            @include circular;

            span {
                padding-right: 2px;
            }

            &.pair-0 {
                background-color: var(--col-map-pair-1)
            }

            &.pair-1 {
                background-color: var(--col-map-pair-2)
            }

            &.pair-2 {
                background-color: var(--col-map-pair-3)
            }

            &.pair-3 {
                background-color: var(--col-map-pair-4)
            }
            &.pair-4 {
                background-color: var(--col-map-pair-5)
            }
        }

        .icon-type {
            @include circular;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            padding: 3px;
        }

        .move-type {
            @include circular;
            font-size: 14px;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            padding: 3px;

            &.guard {
                background-color: var(--col-map-guard);
            }

            &.pursuit {
                background-color: var(--col-map-pursuit);
            }
        }
    }

    .formation-grade {
        position: absolute;
        bottom: 44px;
        z-index: 5000;
        width: 100%;
        height: 22px;
        color: var(--col-theme-text);
        text-align: center;

        .grade {
            font-size: 12px;
            font-weight: 700;
            font-style: italic;
            padding: 0.125rem 0.25rem;
            background-color: var(--col-bg-imglabel);
            @include circular;
            @include unselectable;

            img {
                height:18px;
            }
        }

        .formation-boss {
            height: 22px;
            width: auto;
        }
    }

    &:hover {
        .stage-map-enemy {
            filter: brightness(0.7);
            transform: scale(1.15);
        }
    }
}

.map-controls {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 10000;
}

.btn-circle {
    width: 32px;

    .label {
        padding: 0;
    }
}

</style>