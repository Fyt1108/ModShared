import { A, createAsync, useParams } from "@solidjs/router";
import { Component, createMemo, createSignal, For, Match, Suspense, Switch } from "solid-js";
import { getUserByNameWithModAPI } from "../api/user";
import { DateDisplay } from "../components/DateDisplay";
import { useI18nContext } from "../context/I18nContext";
import { UserWithMod } from "../types/user";
import { formatNumber } from "../utils/numberFormat";

const UserProfile: Component = () => {
    const { t, locale } = useI18nContext()
    const params = useParams()
    const initValue: ApiResponse<UserWithMod> = {
        code: 0,
        data: {
            created_at: "2025-01-01T00:00:00Z",
            id: 0,
            mod: [],
            role: "",
            user_profile: {
                avatar_file: {
                    id: 0,
                    url: ""
                },
                avatar_id: 0,
                description: "",
                id: 0
            },
            user_name: ""
        },
        error: ""
    }

    const userData = createAsync(() => getUserByNameWithModAPI(params.name), {
        initialValue: initValue
    })

    const date = createMemo(() => {
        return new Date(userData()?.data.created_at)
    })
    // eslint-disable-next-line no-unused-vars
    const [totalDownloads, setTotalDownloads] = createSignal(0)

    return (
        <div class="m-auto">
            <Suspense>
                <div class="min-h-screen bg-base-200 rounded-lg w-screen">
                    {/* 头部 */}
                    <div class="bg-base-100 shadow-lg card">
                        <div class="container mx-auto px-4 py-6">
                            <div class="flex flex-col md:flex-row gap-8 items-center">
                                <div class="avatar">
                                    <div class="w-32 rounded-full ring ring-primary ring-offset-base-100">
                                        <img src={userData()?.data.user_profile.avatar_file.url} alt={userData()?.data.user_name} />
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <h1 class="text-4xl font-bold">{userData()?.data.user_name}</h1>
                                    <p class="text-lg opacity-75 mt-2 line-clamp-2">{userData()?.data.user_profile.description}</p>
                                    <div class="flex gap-4 mt-4">
                                        <DateDisplay date={date}>
                                            <span class="icon-[tabler--calendar-month] size-6"></span>
                                            <p>{t("userProfile.joinDate")}</p>
                                        </DateDisplay>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 统计信息 */}
                    <div class="container mx-auto px-4 py-6">
                        <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
                            <div class="stat">
                                <div class="stat-title">{t("userProfile.projectCount")}</div>
                                <div class="stat-value">{userData().data.mod.length}</div>
                            </div>

                            <div class="stat">
                                <div class="stat-title">{t("userProfile.totalDownloads")}</div>
                                <div class="stat-value">{formatNumber(totalDownloads())}</div>
                            </div>
                        </div>
                    </div>

                    {/* 项目列表 */}
                    <div class="container mx-auto px-4 py-8">
                        <h2 class="text-3xl font-bold mb-6">{t("userProfile.projectList")}</h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <For each={userData().data.mod}>
                                {(project, index) => (
                                    setTotalDownloads(project.total_downloads + totalDownloads()),

                                    <div class={"card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200 motion-scale-in-[0.95] motion-translate-y-in-[-20%] motion-opacity-in-[80%] motion-duration-[0.60s] motion-duration-[0.62s]/scale motion-ease-spring-bouncy motion-delay-[--delay]"} style={{ '--delay': `${index() * 15}ms` }}>
                                        <div class="flex flex-row p-4 gap-4">
                                            {/* 图标部分 */}
                                            <div class="shrink-0">
                                                <A href={`/games/${project.game.id}/mods/${project.id}`}>
                                                    <img
                                                        src={project.cover_file.url}
                                                        class="w-24 h-24 rounded-lg object-cover"
                                                        alt="mod_cover"
                                                    />
                                                </A>
                                            </div>

                                            {/* 内容部分 */}
                                            <div class="flex flex-col gap-2 w-full min-w-0">
                                                {/* 标题行 */}
                                                <div class="flex lg:flex-row flex-col lg:justify-between gap-2 w-full">
                                                    <div class="min-w-0 flex-1">
                                                        <A href={`/games/${project.game.id}/mods/${project.id}`} class="block">
                                                            <h3 class="text-lg font-semibold truncate">{project.name}</h3>
                                                        </A>
                                                    </div>
                                                    <div class="gap-2 flex shrink-0">
                                                        <span class="icon-[tabler--heart] size-5 m-auto"></span>
                                                        <p class="inline-block">{formatNumber(project.likes)}</p>
                                                        <span class="icon-[tabler--download] size-5 m-auto"></span>
                                                        <p class="inline-block">{formatNumber(project.total_downloads)}</p>
                                                    </div>
                                                </div>
                                                {/* 描述 */}
                                                <p class="line-clamp-2 mb-2">
                                                    {project.description}
                                                </p>

                                                {/* 标签和版本 */}
                                                <div class="flex flex-wrap gap-2">
                                                    <Switch>
                                                        <Match when={locale() === "zh"}>
                                                            <span class="badge badge-success text-xs">{project.game.name.split("|")[0]}</span>
                                                        </Match>
                                                        <Match when={locale() !== "zh"}>
                                                            <span class="badge badge-success text-xs">{project.game.name.split("|")[1]}</span>
                                                        </Match>
                                                    </Switch>
                                                    <span class="badge badge-outline">{project.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </For>
                        </div>
                    </div>
                </div>
            </Suspense>
        </div>
    )
}

export default UserProfile