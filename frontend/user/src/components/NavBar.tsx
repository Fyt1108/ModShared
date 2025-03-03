import { A } from "@solidjs/router"
import { Component, onMount, Show } from "solid-js"
import { themeChange } from 'theme-change'
import { useI18nContext } from "../context/I18nContext"
import { useAuthStore } from "../stores/auth"
import { I18nButton } from "./I18nButton"

export const NavBar: Component = () => {
    const { t } = useI18nContext()
    const authStore = useAuthStore()

    onMount(() => {
        themeChange(false)
    })

    return (
        <nav class="navbar bg-base-100 rounded-box shadow">
            <div class="flex flex-1 items-center">
                <A class="link text-base-content/90 link-neutral text-xl font-semibold no-underline" href="./">
                    <p>ModVerse</p>
                </A>
            </div>
            <div class="navbar-center max-md:hidden">
                <ul class="menu menu-horizontal p-0 font-medium gap-5">
                    {/* <li><A href="/home">{t("navbar.home")}</A></li> */}
                    <li><A href="/games">{t("navbar.games")}</A></li>
                    <li><A href="/mods">{t("navbar.mods")}</A></li>
                </ul>
            </div>

            <div class="navbar-end flex items-center gap-4">
                <label class="swap swap-rotate btn btn-text btn-circle dropdown-open:bg-base-content/10 size-10">
                    <input type="checkbox" data-toggle-theme="rosepineMoon" />
                    <span class="swap-off icon-[tabler--sun] size-7"></span>
                    <span class="swap-on icon-[tabler--moon] size-7"></span>
                </label>
                <I18nButton />
                <Show when={authStore.isLogin()}>
                    <div class="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
                        <button id="dropdown-scrollable" type="button" class="dropdown-toggle flex items-center"
                            aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                            <div class="avatar">
                                <div class="size-9.5 rounded-full">
                                    <img src={authStore.profile()?.user_profile?.avatar_file.url} alt="avatar" />
                                </div>
                            </div>
                        </button>
                        <ul class="dropdown-menu dropdown-open:opacity-100 hidden min-w-60" role="menu"
                            aria-orientation="vertical" aria-labelledby="dropdown-avatar">
                            <A href="/my-profile/">
                                <li class="dropdown-header gap-2">
                                    <div class="avatar">
                                        <div class="w-10 rounded-full">
                                            <img src={authStore.profile()?.user_profile?.avatar_file.url} alt="avatar" />
                                        </div>
                                    </div>
                                    <div>
                                        <h6 class="text-base-content/90 text-base font-semibold">{authStore.profile()?.user_name}</h6>
                                        <small class="text-base-content/50">{authStore.profile()?.role.toUpperCase()}</small>
                                    </div>
                                </li>
                            </A>
                            <li>
                                <A href="/my-favorite" class="dropdown-item">
                                    <span class="icon-[tabler--star]"></span>
                                    我的收藏
                                </A>
                            </li>
                            <li>
                                <A href="/my-mod" class="dropdown-item">
                                    <span class="icon-[tabler--align-box-left-middle]"></span>
                                    {t('navbar.myMods')}
                                </A>
                            </li>
                            <li>
                                <A class="dropdown-item" href="/create-mod">
                                    <span class="icon-[tabler--settings]"></span>
                                    发布模组
                                </A>
                            </li>
                            <li class="dropdown-footer gap-2">
                                <button class="btn btn-error btn-soft btn-block" onClick={authStore.logout}>
                                    <span class="icon-[tabler--logout]"></span>
                                    {t('auth.logout')}
                                </button>
                            </li>
                        </ul>
                    </div>
                </Show>
                <Show when={!authStore.isLogin()}>
                    <div>
                        <A href="/login" class="btn btn-primary text-white"><span
                            class="icon-[tabler--door-exit] size-5"></span>
                            <p class="hidden lg:block">{t('auth.login')}</p>
                        </A>
                    </div>
                </Show>
                <label class="btn btn-circle swap swap-rotate md:hidden">
                    <input type="checkbox" />
                    <span class="icon-[tabler--menu-2] swap-off"></span>
                    <span class="icon-[tabler--x] swap-on"></span>
                </label>
            </div>
        </nav>
    )
}