import { A, createAsync, useParams } from "@solidjs/router"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { HSAccordion } from "flyonui/flyonui"
import { createEffect, createMemo, createSignal, For, Match, onMount, Show, Suspense, Switch } from "solid-js"
import { createStore } from "solid-js/store"
import { getCategoryAPI } from "../api/categories"
import { getModsAPI } from "../api/mod"
import { CategoryButton } from "../components/CategoryButton"
import { Pagination } from "../components/Pagination"
import { Search } from "../components/Search"
import { useI18nContext } from "../context/I18nContext"
import { CategoriesQuery } from "../types/categories"
import { ModQuery } from "../types/mod"
import { formatNumber } from "../utils/numberFormat"

const Mods = () => {
    const { t, locale } = useI18nContext()
    const params = useParams()
    let accordion: HSAccordion
    const [windowWidth, setWindowWidth] = createSignal(window.innerWidth)

    const [modQuery, setModQuery] = createStore<ModQuery>({
        category: [],
        name: "",
        page: 1,
        page_size: 12,
        sort: "name",
        order: "",
        gameID: 0,
        status: "enable"
    })
    const cateQuery: CategoriesQuery = {
        status: "enable"
    }

    const selectCategory = (item: string) => {
        if (modQuery.category?.includes(item)) {
            setModQuery("category", modQuery.category.filter(i => i !== item))
        } else {
            setModQuery("category", [...modQuery.category, item])
        }
    }

    const categories = createAsync(() => getCategoryAPI(cateQuery))

    const modList = createAsync(() => getModsAPI(modQuery, false))

    const totalPage = createMemo(() => {
        const total = modList()?.data.total ?? 0
        const pageSize = modQuery.page_size
        return Math.ceil(total / pageSize!)
    })

    onMount(() => {
        accordion = new HSAccordion(document.querySelector('#categories-popout')!)
        window.addEventListener("resize", handleResize)

        return () => {
            accordion.destroy()
            window.removeEventListener("resize", handleResize)
        }
    })

    createEffect(() => {
        if (windowWidth() >= 1024) {
            accordion.show()
        } else {
            accordion.hide()
        }

        if (params.gameID) {
            setModQuery("gameID", parseInt(params.gameID))
        }
    })

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    }

    return (
        <div class="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
            {/* 分类侧边栏 */}
            <div class="w-full lg:w-64 shrink-0 space-y-6">
                <div class="accordion accordion-shadow mt-10">
                    <div class="accordion-item accordion-item-active:scale-[1.05] accordion-item-active:mb-3 active transition-transform ease-in duration-300 delay-[1ms]" id="categories-popout" >
                        <button class="accordion-toggle inline-flex items-center gap-x-4 px-5 py-4 text-start" aria-controls="categories-popout-collapse" aria-expanded="true">
                            分类
                            <span class="icon-[tabler--chevron-right] accordion-item-active:rotate-90 size-5 shrink-0 transition-transform duration-300 rtl:rotate-180 ml-auto" ></span>
                        </button>
                        <div id="categories-popout-collapse" class="accordion-content w-full overflow-hidden transition-[height] duration-300" aria-labelledby="categories-popout" role="region">
                            <div class="px-5 pb-4 gap-3 flex flex-col items-center">
                                <Suspense>
                                    <For each={categories()?.data.list}>
                                        {(item, _index) => (
                                            <Switch>
                                                <Match when={locale() === "zh"}>
                                                    <CategoryButton text={item.name.split("|")[0]} click={() => selectCategory(item.name)} />
                                                </Match>
                                                <Match when={locale() !== "en"}>
                                                    <CategoryButton text={item.name.split("|")[1]} click={() => selectCategory(item.name)} />
                                                </Match>
                                            </Switch>
                                        )}
                                    </For>
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col flex-grow w-screen">
                <div class="rounded-box h-24 flex-row flex p-10 items-center gap-10">
                    <div class="mt-auto">
                        <Search setter={setModQuery} key="name" delay={400} placeholder={t('searchPlaceholder')} />
                    </div>
                    <div class="flex flex-row">
                        <div class="w-40 flex flex-col">
                            <label class="label label-text" for="sort">{t("sort.sortBy")}</label>
                            <select class="select" id="sort" value={modQuery.sort} onChange={(event) => { setModQuery("sort", event.target.value) }}>
                                <option selected value="name">{t("sort.name")}</option>
                                <option value="total_downloads">{t("sort.downloads")}</option>
                                <option value="likes">{t("sort.followers")}</option>
                                <option value="last_update">{t("sort.lastUpdate")}</option>
                            </select>
                        </div>
                        <div class="mt-auto ml-2">
                            <span class="icon-[tabler--arrows-sort] size-6 cursor-pointer" onClick={() => { setModQuery("order", modQuery.order === "asc" ? "desc" : "asc") }}></span>
                        </div>
                    </div>
                </div>
                <Show when={modList()?.data.total === 0}>
                    <div class="m-auto text-lg">无搜索结果</div>
                </Show>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 p-4 max-w-7xl">
                    <Suspense>
                        <For each={modList()?.data.list}>
                            {(item, index) =>
                                <div class={"card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200 motion-scale-in-[0.95] motion-translate-y-in-[-20%] motion-opacity-in-[80%] motion-duration-[0.60s] motion-duration-[0.62s]/scale motion-ease-spring-bouncy motion-delay-[--delay]"} style={{ '--delay': `${index() * 15}ms` }}>
                                    <div class="flex flex-row p-4 gap-4">
                                        {/* 图标部分 */}
                                        <div class="shrink-0">
                                            <A href={`/games/${item.game.id}/mods/${item.id}`}>
                                                <img
                                                    src={item.cover_file.url}
                                                    class="w-24 h-24 rounded-lg object-cover"
                                                    alt="模组图标"
                                                />
                                            </A>
                                        </div>
                                        {/* 内容部分 */}
                                        <div class="flex flex-col gap-2 w-full min-w-0">
                                            {/* 标题行 */}
                                            <div class="flex lg:flex-row flex-col lg:justify-between gap-2">
                                                <A href={`/games/${item.game.id}/mods/${item.id}`}> <h3 class="text-lg font-semibold truncate">{item.name}</h3></A>
                                                <div class="gap-2 flex mr-auto lg:m-0">
                                                    <span class="icon-[tabler--heart] size-5 m-auto"></span>
                                                    <p class="inline-block">{formatNumber(item.likes)}</p>
                                                    <span class="icon-[tabler--download] size-5 m-auto"></span>
                                                    <p class="inline-block">{formatNumber(item.total_downloads)}</p>
                                                </div>
                                            </div>

                                            {/* 作者和更新时间 */}
                                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                                <A href={`/user/${item.user.user_name}`}><span>{item.user.user_name}</span></A>
                                                <span>•</span>
                                                <span>
                                                    {formatDistanceToNow(new Date(item.last_update), {
                                                        addSuffix: true,
                                                        locale: zhCN,
                                                    })}
                                                </span>
                                            </div>

                                            {/* 描述 */}
                                            <p class="line-clamp-2 mb-2">
                                                {item.description}
                                            </p>

                                            {/* 标签和版本 */}
                                            <div class="flex flex-wrap gap-2">  <Switch>
                                                <Match when={locale() === "zh"}>
                                                    <span class="badge badge-success text-xs">{item.game.name.split("|")[0]}</span>
                                                </Match>
                                                <Match when={locale() !== "zh"}>
                                                    <span class="badge badge-success text-xs">{item.game.name.split("|")[1]}</span>
                                                </Match>
                                            </Switch>
                                                <span class="badge badge-outline">{item.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </For>
                    </Suspense>
                </div>
                <Show when={modList()?.data.total !== 0 || undefined}>
                    <div class="m-auto mb-5">
                        <Pagination currentPage={modQuery.page!} totalPages={totalPage()} setPage={setModQuery} />
                    </div>
                </Show>
            </div>
        </div >
    )
}

export default Mods