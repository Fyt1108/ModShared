import { lazy } from "solid-js";

export const Routes = [
    {
        path: '/',
        component: lazy(() => import("../views/Games"))
    },
    {
        path: '/login',
        component: lazy(() => import("../views/Login"))
    },
    {
        path: '/register',
        component: lazy(() => import("../views/Register"))
    },
    {
        path: '/reset-password/reset/:token',
        component: lazy(() => import("../views/ResetPassword"))
    },
    {
        path: '/reset-password',
        component: lazy(() => import("../views/SendResetEmail"))
    },
    {
        path: '/create-mod',
        component: lazy(() => import("../views/CreateMod"))

    },
    {
        path: '/change-password',
        component: lazy(() => import("../views/ChangePassword"))
    },
    {
        path: '/games',
        component: lazy(() => import("../views/Games"))
    },
    {
        path: '/games/:gameID/mods',
        component: lazy(() => import("../views/Mods"))
    },
    {
        path: '/mods',
        component: lazy(() => import("../views/Mods"))
    },
    {
        path: '/games/:gameID/mods/:id',
        component: lazy(() => import("../views/ModDetails"))
    },
    {
        path: '/my-profile',
        component: lazy(() => import("../views/MyProfile"))
    },
    {
        path: '/profile-setting',
        component: lazy(() => import("../views/ProfileSetting"))
    },
    {
        path: 'user/:name',
        component: lazy(() => import("../views/UserProfile"))
    },
    {
        path: '/my-mod',
        component: lazy(() => import("../views/MyMod"))
    },
    {
        path: '/my-favorite',
        component: lazy(() => import("../views/Favorite"))
    },
    {
        path: '/change-password',
        component: lazy(() => import("../views/ChangePassword"))
    }
]