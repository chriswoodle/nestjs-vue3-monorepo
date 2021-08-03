import * as VueRouter from 'vue-router';

import Welcome from './welcome/Welcome.vue';
import Login from './welcome/Login.vue';

import Main from './main/Main.vue';
import Home from './main/Home.vue';

import { authGuard, unauthGuard } from './common/auth';

export enum RouteNames {
    Home = 'home',
    Login = 'Login',
}

const routes: VueRouter.RouteRecordRaw[] = [
    {
        path: '/',
        component: Welcome,
        beforeEnter: unauthGuard,
        children: [
            { path: '/', component: Login, name: RouteNames.Login },
        ]
    },
    {
        path: '/',
        component: Main,
        beforeEnter: authGuard,
        children: [
            { path: '/', component: Home, name: RouteNames.Home },
        ]
    }
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
export const router = VueRouter.createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: VueRouter.createWebHashHistory(),
    routes, // short for `routes: routes`
})
