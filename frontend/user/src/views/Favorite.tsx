import { A, createAsync } from "@solidjs/router";
import { Component, createEffect, createMemo, Match, Suspense, Switch } from "solid-js";

import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { DeleteModFavoriteAPI, GetModFavoritesAPI } from "../api/mod_favorite";
import { Pagination } from "../components/Pagination";
import { Search } from "../components/Search";
import { useI18nContext } from "../context/I18nContext";
import { ModFavoriteQuery } from "../types/mod_favorite";
import { formatNumber } from "../utils/numberFormat";

const Favorites: Component = () => {
    const { t, locale } = useI18nContext()
    const [reload, serReload] = createSignal(false)
    const [query, setQuery] = createStore<ModFavoriteQuery>({
        name: "",
        page: 1,
        page_size: 10,
        sort: "last_update",
        order: "desc",
        game_id: 0
    })
    const [total, setTotal] = createSignal(0)
    let flag = true

    const favorite = createAsync(() => GetModFavoritesAPI(query, reload()))

    const totalPage = createMemo(() => {
        const total = favorite()?.data.total ?? 0
        const pageSize = query.page_size
        return Math.ceil(total / pageSize!)
    })


    // 取消收藏确认
    const confirmUnfavorite = async (id: number) => {
        if (confirm("确定要取消收藏此模组吗？")) {
            await DeleteModFavoriteAPI(id)
            serReload(!reload())
        }
    }

    createEffect(() => {
        if (favorite()?.data.total && flag) {
            setTotal(favorite()!.data.total)
            flag = false
        }
    })

    return (
        <div class="m-auto w-screen bg-base-200">
            <div class="min-h-screen p-4 md:p-8">
                <div class="container mx-auto">
                    {/* 标题和统计 */}
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold">我的收藏</h1>
                        <div class="stats stats-horizontal shadow mt-4">
                            <div class="stat">
                                <div class="stat-title">总收藏数</div>
                                <div class="stat-value text-primary">{total()}</div>
                            </div>
                        </div>
                    </div>

                    {/* 控制栏 */}
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Search setter={setQuery} key="name" delay={400} placeholder={t('searchPlaceholder')} />

                        <select
                            class="select select-bordered"
                            value={query.sort}
                            onChange={(e) => setQuery("sort", e.target.value)}
                        >
                            <option value="last_update">最近更新</option>
                            <option value="name">名称</option>
                            <option value="likes">喜爱数</option>
                            <option value="total_downloads">下载量</option>
                        </select>

                        <select
                            class="select select-bordered"
                            value={query.game_id}
                            onChange={(e) => setQuery("game_id", parseInt(e.target.value))}
                        >
                            <option value="0">全部分类</option>
                            <For each={favorite()?.data.list || []}>
                                {(mf) =>
                                    <option value={mf.mod.game.id}>{mf.mod.game.name}</option>
                                }
                            </For>
                        </select>
                        <div class="mt-auto ml-2">
                            <span class="icon-[tabler--arrows-sort] size-6 cursor-pointer" onClick={() => { setQuery("order", query.order === "asc" ? "desc" : "asc") }}></span>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 p-4 max-w-7xl">
                        <Suspense>
                            <For each={favorite()?.data.list}>
                                {(item, index) =>
                                    <div class={"card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200 motion-scale-in-[0.95] motion-translate-y-in-[-20%] motion-opacity-in-[80%] motion-duration-[0.60s] motion-duration-[0.62s]/scale motion-ease-spring-bouncy motion-delay-[--delay]"} style={{ '--delay': `${index() * 15}ms` }}>
                                        <div class="flex flex-row p-4 gap-4">
                                            {/* 图标部分 */}
                                            <div class="shrink-0">
                                                <A href={`/games/${item.mod.game.id}/mods/${item.mod.id}`}>
                                                    <img
                                                        src={item.mod.cover_file.url}
                                                        class="w-24 h-24 rounded-lg object-cover"
                                                        alt="模组图标"
                                                    />
                                                </A>
                                            </div>
                                            {/* 内容部分 */}
                                            <div class="flex flex-col gap-2 w-full min-w-0">
                                                {/* 标题行 */}
                                                <div class="flex lg:flex-row flex-col lg:justify-between gap-2">
                                                    <A href={`/games/${item.mod.game.id}/mods/${item.mod.id}`}> <h3 class="text-lg font-semibold truncate">{item.mod.name}</h3></A>
                                                    <div class="gap-2 flex mr-auto lg:m-0">
                                                        <span class="icon-[tabler--heart] size-5 m-auto"></span>
                                                        <p class="inline-block">{formatNumber(item.mod.likes)}</p>
                                                        <span class="icon-[tabler--download] size-5 m-auto"></span>
                                                        <p class="inline-block">{formatNumber(item.mod.total_downloads)}</p>
                                                    </div>
                                                </div>

                                                {/* 作者和更新时间 */}
                                                <div class="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>
                                                        {formatDistanceToNow(new Date(item.mod.last_update), {
                                                            addSuffix: true,
                                                            locale: zhCN,
                                                        })}
                                                    </span>
                                                </div>

                                                {/* 描述 */}
                                                <p class="line-clamp-2 mb-2">
                                                    {item.mod.description}
                                                </p>

                                                {/* 标签和版本 */}
                                                <div class="flex flex-wrap gap-2">  <Switch>
                                                    <Match when={locale() === "zh"}>
                                                        <span class="badge badge-success text-xs">{item.mod.game.name.split("|")[0]}</span>
                                                    </Match>
                                                    <Match when={locale() !== "zh"}>
                                                        <span class="badge badge-success text-xs">{item.mod.game.name.split("|")[1]}</span>
                                                    </Match>
                                                </Switch>
                                                    <span class="badge badge-outline">{item.mod.category}</span>
                                                </div>
                                            </div>
                                            <button class="btn btn-warning btn-sm mt-auto" onClick={() => confirmUnfavorite(item.mod.id)}>取消收藏</button>
                                        </div>
                                    </div>
                                }
                            </For>
                        </Suspense>
                    </div>

                    {/* 空状态 */}
                    <Show when={favorite()?.data.list.length === 0}>
                        <div class="text-center py-16">
                            <div class="text-4xl mb-4">❤️</div>
                            <p class="text-xl font-bold mb-2">收藏夹空空如也</p>
                            <p class="text-gray-500 mb-4">发现精彩模组并添加到收藏吧！</p>
                            <button class="btn btn-primary gap-2">
                                <span class="i-heroicons-magnifying-glass-20-solid" />
                                浏览模组
                            </button>
                        </div>
                    </Show>
                </div>
            </div>
            <Show when={favorite()?.data.total !== 0 || undefined}>
                <div class="m-auto flex bg-base-200 justify-center mb-5">
                    <Pagination currentPage={query.page!} totalPages={totalPage()} setPage={setQuery} />
                </div>
            </Show>
        </div >
    );
};

export default Favorites