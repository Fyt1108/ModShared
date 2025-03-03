import { A, createAsync } from "@solidjs/router"
import { createMemo, For, Match, Show, Suspense, Switch } from "solid-js"
import { createStore } from "solid-js/store"
import { getGamesAPI } from "../api/game"
import { Pagination } from "../components/Pagination"
import { Search } from "../components/Search"
import { useI18nContext } from "../context/I18nContext"
import { GameQuery } from "../types/game"

const Games = () => {
    const { t, locale } = useI18nContext()
    const [gameQuery, setGameQuery] = createStore<GameQuery>({
        name: "",
        page: 1,
        page_size: 16,
        sort: "name",
        order: "desc",
    })

    const gamesList = createAsync(() => getGamesAPI(gameQuery))
    const totalPage = createMemo(() => {
        const total = gamesList()?.data.total ?? 0
        const pageSize = gameQuery.page_size
        return Math.ceil(total / pageSize!)
    })

    return (
        <div class="flex flex-col w-full">
            <div class="hidden md:block">
                <div class="rounded-box h-24 flex-row flex p-10 items-center gap-10">
                    <div class="mt-auto">
                        <Search setter={setGameQuery} key="name" delay={400} placeholder={t('searchPlaceholder')} />
                    </div>
                    <div class="flex flex-row">
                        <div class="w-40 flex flex-col">
                            <label class="label label-text" for="sort">{t("sort.sortBy")}</label>
                            <select class="select" id="sort" value={gameQuery.sort} onChange={(event) => { setGameQuery("sort", event.target.value) }}>
                                <option selected value="name">{t("sort.name")}</option>
                                <option value="follows">{t("sort.followers")}</option>
                                <option value="mod_nums">{t("sort.modNums")}</option>
                            </select>
                        </div>
                        <div class="mt-auto ml-2">
                            <span class="icon-[tabler--arrows-sort] size-6 cursor-pointer" onClick={() => { setGameQuery("order", gameQuery.order === "asc" ? "desc" : "asc") }}></span>
                        </div>
                    </div>
                </div>
            </div>
            <Show when={gamesList()?.data.total === 0}>
                <div class="m-auto text-lg">无搜索结果</div>
            </Show>
            <Suspense fallback={<div class="m-auto"><span class="loading loading-dots loading-lg"></span></div>}>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 m-6">
                    <For each={gamesList()?.data.list}>
                        {(game, index) =>
                            <div class={"card group hover:shadow sm:max-w-xs motion-scale-in-[0.95] motion-translate-x-in-[-7%] motion-translate-y-in-[-13%] motion-opacity-in-[80%] motion-duration-[0.60s] motion-duration-[0.62s]/scale motion-ease-spring-bouncy motion-delay-[--delay]"} style={{ '--delay': `${index() * 15}ms` }}
                                id={game.id.toString()}>
                                <figure class="aspect-[5/6] overflow-hidden">
                                    <A href={"/games/" + game.id + "/mods"}>
                                        <img src={game.logo_file.url} class="transition-transform duration-500 group-hover:scale-110 w-full h-full" />
                                    </A>
                                </figure>
                                <div class="card-body">
                                    <Switch>
                                        <Match when={locale() === "zh"}>
                                            <h5 class="card-title mb-2.5 truncate text-xl">{game.name.split("|")[0]}</h5>
                                            <h6 class="text-sm mb-2">{game.name.split("|")[1]}</h6>
                                        </Match>
                                        <Match when={locale() !== "zh"}>
                                            <h5 class="card-title mb-2.5 truncate text-xl">{game.name.split("|")[1]}</h5>
                                            <h6 class="text-sm mb-2">{game.name.split("|")[0]}</h6>
                                        </Match>
                                    </Switch>
                                    <div class="flex flex-row gap-3">
                                        <div class="flex flex-row items-center">
                                            <span class="icon-[tabler--apps]"></span>
                                            <p>{game.mod_nums}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>}
                    </For>
                </div>
            </Suspense>
            <Show when={gamesList()?.data.total !== 0 || undefined}>
                <div class="m-auto mb-5">
                    <Pagination currentPage={gameQuery.page!} totalPages={totalPage()} setPage={setGameQuery} />
                </div>
            </Show>
        </div>
    )
}

export default Games