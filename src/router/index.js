import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '../stores/DataStore';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue'),
            meta: {
                requiredJson: ['students']
            }
        },
        {
            path: '/student',
            name: 'studentlistview',
            component: () => import('../views/StudentListView.vue'),
            meta: {
                requiredJson: ['students', 'items', 'equipment']
            }            
        },
        {
            path: '/student/:studentid',
            name: 'studentview',
            component: () => import('../views/StudentView.vue'),
            meta: {
                requiredJson: ['students', 'summons', 'items', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/item',
            name: 'itemlistview',
            component: () => import('../views/ItemListView.vue'),
            meta: {
                requiredJson: ['students', 'items', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/furniture',
            name: 'furniturelistview',
            component: () => import('../views/ItemListView.vue'),
            meta: {
                requiredJson: ['students', 'items', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/equipment',
            name: 'equipmentlistview',
            component: () => import('../views/ItemListView.vue'),
            meta: {
                requiredJson: ['students', 'items', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/item/:itemid',
            name: 'itemview',
            component: () => import('../views/ItemView.vue'),
            meta: {
                requiredJson: ['students', 'items', 'groups', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/equipment/:equipmentid',
            name: 'equipmentview',
            component: () => import('../views/ItemView.vue'),
            meta: {
                requiredJson: ['students', 'items', 'groups', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/furniture/:furnitureid',
            name: 'furnitureview',
            component: () => import('../views/ItemView.vue'),
            meta: {
                requiredJson: ['students', 'items', 'groups', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/stage/:stageid?',
            name: 'stageview',
            component: () => import('../views/StageView.vue'),
            meta: {
                requiredJson: ['students', 'stages', 'enemies', 'items', 'groups', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/event/:eventid?',
            name: 'eventview',
            component: () => import('../views/EventView.vue'),
            meta: {
                requiredJson: ['students', 'events', 'stages', 'enemies', 'items', 'groups', 'equipment', 'furniture', 'currency']
            },
            children: [
                {
                    path: 'stage/:stageid?',
                    name: 'eventStageView',
                    component: () => import('../components/event/EventStages.vue')
                }
            ] 
        },
        {
            path: '/crafting/:nodeid?',
            name: 'craftingview',
            component: () => import('../views/CraftingView.vue'),
            meta: {
                requiredJson: ['crafting', 'students', 'items', 'groups', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/raid/:raidid?',
            name: 'raidview',
            component: () => import('../views/RaidView.vue'),
            meta: {
                requiredJson: ['raids', 'students', 'enemies', 'items', 'groups', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/timeattack/:raidid?',
            name: 'timeattackview',
            component: () => import('../views/RaidView.vue'),
            meta: {
                requiredJson: ['raids', 'students', 'enemies', 'items', 'groups', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/worldraid/:raidid?',
            name: 'worldraidview',
            component: () => import('../views/RaidView.vue'),
            meta: {
                requiredJson: ['raids', 'students', 'enemies', 'items', 'groups', 'equipment', 'furniture', 'currency']
            }  
        },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return { top: savedPosition.top, behavior: 'instant'};
        }
    }
})

router.beforeEach(async (to) => {
    if (to.meta.requiredJson) {
        await useDataStore().ensureData('config', ...to.meta.requiredJson);
    }
})

export default router
