import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useDataStore } from '../stores/DataStore';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
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
            component: () => import('../views/ItemView.vue'),
            meta: {
                requiredJson: ['items', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/item/:itemid',
            name: 'itemview',
            component: () => import('../views/ItemView.vue'),
            meta: {
                requiredJson: ['items', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/equipment/:equipmentid',
            name: 'equipmentview',
            component: () => import('../views/ItemView.vue'),
            meta: {
                requiredJson: ['items', 'equipment', 'furniture', 'currency']
            }  
        },
        {
            path: '/furniture/:furnitureid',
            name: 'furnitureview',
            component: () => import('../views/ItemView.vue'),
            meta: {
                requiredJson: ['items', 'equipment', 'furniture', 'currency']
            }  
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return { top: savedPosition.top, behavior: 'instant'};
        } else {
            return { top: 0, behavior: 'instant' };
        }
    }
})

router.beforeEach(async (to) => {
    if (to.meta.requiredJson) {
        await useDataStore().ensureData(...to.meta.requiredJson);
    }
})

export default router
