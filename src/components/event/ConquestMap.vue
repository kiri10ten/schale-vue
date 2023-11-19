<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMixedTypeGradient, numberToLetter } from '../../composables/Utilities';
import { getEnemyById } from '../../composables/Enemies';
import { useElementBounding } from '@vueuse/core';
import { getConquestStageById } from '../../composables/Events';
import { translateUi } from '../../composables/Localization';

const props = defineProps({
    conquestMap: {
        type: Object,
        required: true
    },
    selectedTile: Number
})

const emit = defineEmits(['selectTile']);

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

const currentMapId = ref(0);

const currentMap = computed(() => props.conquestMap.Maps[currentMapId.value]);

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

    for (const tile of currentMap.value.Tiles) {
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

const renderTiles = computed(() => {
    const renderTiles = [];
    
    for (const [i, tile] of currentMap.value.Tiles.entries()) {

        const renderTile = {}
        
        const xNormal = tile.Pos[0] - mapBounds.value.xMin;
        const yNormal = tile.Pos[1] - mapBounds.value.yMin;

        renderTile.style = {
            left: `${xNormal * tileWidth + (yNormal * tileWidth * 0.5) - mapBounds.value.offsetLeft + 16}px`,
            top: `${yNormal * Math.sqrt(Math.pow(tileHeight / 2, 2) * 3) + mapBounds.value.offsetTop}px`,
        }

        renderTile.zIndex = yNormal;

        if (tile.Item) {
            renderTile.item = tile.Item;
        }

        renderTile.start = (tile.Type == 'Start');

        renderTile.icon = `Conquest_${props.conquestMap.EventId}_Img_Tile_${tile.Type.replace('Start', 'Base')}${tile.Type != 'Normal' ? '_0' : ''}`;
        if (tile.Type != 'Start' && currentMap.value.Difficulty == 'VeryHard') {
            renderTile.icon += '_Challenge';
        }

        if (tile.StageId) {
            const conquestStage = getConquestStageById(tile.StageId);
            const formation = conquestStage.Formations[0];

            const armorTypes = [];

            for (const enemyId of formation.EnemyList) {
                const enemy = getEnemyById(enemyId);
                if (enemy.SquadType != 'Support' && armorTypes.indexOf(enemy.ArmorType) == -1) {
                    armorTypes.push(enemy.ArmorType);
                }
            }

            renderTile.style.cursor = 'pointer';
            renderTile.formation = {
                id: conquestStage.Id,
                icon: formation.MapIcon,
                level: conquestStage.Level,
                enemyType: conquestStage.EnemyType,
                team: conquestStage.Team,
                zIndex: 100 + yNormal,
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

<nav class="nav nav-pills justify-content-center mb-2">
    <button v-for="(map, index) in conquestMap.Maps" class="nav-link" :class="{active: index == currentMapId}" @click="currentMapId = index">
        <template v-if="map.Difficulty == 'Normal'">{{ translateUi('conquest_area', map.Step + 1) }}</template>
        <template v-if="map.Difficulty == 'VeryHard'">Challenge</template>
    </button>
</nav>

<div class="position-relative">
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
            <component v-for="(tile, index) in renderTiles"
                :is="tile.formation ? 'RouterLink' : 'div'"
                class="stage-map-tile"
                :class="{selected: tile.formation && tile.formation?.id == selectedTile}"
                :style="tile.style"
                :key="`${conquestMap.EventId}_${currentMapId}_${index}`"
                :to="{name: 'eventStageView', params: {eventid: props.conquestMap.EventId, stageid: tile.formation?.id}}">

                <img class="tile-icon" :style="{zIndex: tile.zIndex}" :src="`/images/conquest/${tile.icon}.png`" >
                <img v-if="tile.start" class="start-tile" src="/images/ui/Image_Campaign_Start.png">
                <!-- <img v-if="tile.item" class="tile-item" :style="{zIndex: 100 + tile.zIndex}" :src="`/images/tile/Item_${tile.item}.png`"> -->
                <template v-if="tile.formation">
                    <img class="stage-map-enemy" :src="`/images/enemy/${tile.formation.icon}.webp`" :style="{zIndex: tile.formation.zIndex}">
                    <span class="formation-grade">
                        <img v-if="tile.formation.enemyType == 'Boss'" class="formation-boss" :src="`/images/ui/Image_Campaign_Boss.png`">
                        <img v-else-if="tile.formation.enemyType == 'MiddleBoss'" class="formation-leader" :src="`/images/ui/Image_Conquest_Leader.png`">
                        <span v-else class="grade">
                            Lv.{{ tile.formation.level }}
                        </span>
                    </span>
                </template>
                <div v-if="tile.formation" class="formation-info">
                    <span v-if="tile.formation.team != 'None'" class="formation-team" :class="tile.formation.team.toLowerCase()">
                        <span class="font-nexon">{{ tile.formation.team.slice(-1) }}</span>
                    </span>
                    <span v-if="tile.formation" class="icon-type" :style="{background: tile.formation.armorTypesBG}"><img src="/images/ui/Type_Defense_s.png" height="14"></span>
                </div>
            </component>
        </div>
    </div>    
</div>


</template>

<style scoped lang="scss">
@import '../../styles/_mixins.scss';

.stage-map-tile {

    width: 96px;
    height: 80px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;

    &.selected, &.router-link-active {
        .tile-icon {
            filter: brightness(0.5);
        }
    }

    .tile-icon {
        position: absolute;
        width: 142px;
        bottom: -20px;
        pointer-events: none;
        //height: 130px;

        &.tile-hidden {
            opacity: 0.5;
        }
    }

    .start-tile {
        position: absolute;
        bottom: 34px;
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

        .formation-team {
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

            &.team1 {
                background-color: var(--col-conquest-team-1);
            }

            &.team2 {
                background-color: var(--col-conquest-team-2);
            }

            &.team3 {
                background-color: var(--col-conquest-team-3);
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

        .formation-leader {
            height: 18px;
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