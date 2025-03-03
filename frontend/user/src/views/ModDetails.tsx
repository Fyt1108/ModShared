import { A, createAsync, useNavigate, useParams } from "@solidjs/router"
import { format } from "date-fns"
import edjsHTML from "editorjs-html"
import { HSOverlay, HSTabs } from "flyonui/flyonui"
import { createEffect, createMemo, createSignal, For, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { getModAPI } from "../api/mod"
import { CheckIsFavoriteAPI, CreateModFavoriteAPI, DeleteModFavoriteAPI } from "../api/mod_favorite"
import { getLikeStatus, likeMod, unlikeMod } from "../api/mod_like"
import { getModVersions } from "../api/mod_version"
import { CreateReport } from "../api/report"
import CommentPage from "../components/Comment"
import { DateDisplay } from "../components/DateDisplay"
import { VersionsTable } from "../components/Versions"
import { useNotifyContext } from "../context/NotifyContext"
import { useAuthStore } from "../stores/auth"
import { CreateReportRequest } from "../types/report"

const ModDetails = () => {
    //const { t } = useI18nContext()
    const notify = useNotifyContext()
    const params = useParams()
    const navigate = useNavigate()
    let flag = true
    let download
    let modal: HSOverlay

    const [html, setHTML] = createSignal("")
    const [reload, setReload] = createSignal(false)
    const [favoriteReload, setFavoriteReload] = createSignal(false)
    const [likeReload, setLikeReload] = createSignal(false)

    const mod = createAsync(() => getModAPI(params.id))
    const modVersions = createAsync(() => getModVersions(params.id, reload()))
    const checkIsFavorite = createAsync(() => CheckIsFavoriteAPI(parseInt(params.id), favoriteReload()))
    const checkIsLike = createAsync(() => getLikeStatus(params.id, likeReload()))
    const [report, setReport] = createStore<CreateReportRequest>({
        type: "",
        target: 0,
        reason: "侵权",
    })

    createEffect(() => {
        if (mod() && flag) {
            const edjsParser = edjsHTML()
            const json = JSON.parse(mod()?.data.content!)
            setHTML(edjsParser.parse(json))
            flag = false
        }
    })

    onMount(() => {
        setTimeout(() => {
            window.HSStaticMethods.autoInit()
        }, 800)
        modal = new HSOverlay(document.querySelector('#focus-modal')!)
        return () => {
            modal.destroy()
        }
    })

    const createTime = createMemo(() => mod() ? new Date(mod()!.data.CreatedAt) : new Date("2025-01-01T00:00:00Z"))
    const updateTime = createMemo(() => mod() ? new Date(mod()!.data.last_update) : new Date("2025-01-01T00:00:00Z"))

    const handleFavorite = async () => {
        if (!useAuthStore().isLogin()) {
            navigate("/login")
        } else if (!checkIsFavorite()?.data) {
            await CreateModFavoriteAPI(parseInt(params.id))
            setFavoriteReload(!favoriteReload())
        } else if (checkIsFavorite()?.data) {
            await DeleteModFavoriteAPI(parseInt(params.id))
            setFavoriteReload(!favoriteReload())
        }
    }

    const handleLike = async () => {
        if (!useAuthStore().isLogin()) {
            navigate("/login")
        } else if (!checkIsLike()?.data) {
            await likeMod(params.id)
            setLikeReload(!likeReload())
        } else if (checkIsLike()?.data) {
            await unlikeMod(params.id)
            setLikeReload(!likeReload())
        }
    }

    const handleModSubmit = async (e: Event) => {
        e.preventDefault()

        setReport("target", parseInt(params.id))
        try {
            await CreateReport(report)
            modal.close()
            notify.success("提交成功")
        } catch {
            modal.close()
            notify.error("提交失败")
        }
    }

    return (
        <div class="mx-24 mt-10 w-full">
            <div class="flex flex-row w-full">
                <div class="avatar">
                    <div class="size-25 rounded-md">
                        <img src={mod()?.data.cover_file.url} alt="mod_cover" />
                    </div>
                </div>
                <div class="flex flex-col ml-3">
                    <h3 class="text-base-content text-2xl font-bold">{mod()?.data.name}</h3>
                    <p> {mod()?.data.description}</p>
                    <div class="mt-auto flex flex-wrap gap-4 empty:hidden">
                        <div class="flex items-center gap-2 pr-4 font-semibold cursor-help tooltip">
                            <span class="icon-[tabler--download] size-6"></span>
                            {mod()?.data.total_downloads}
                            <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                                <span class="tooltip-body">下载量</span>
                            </span>
                        </div>
                        <div class="flex items-center gap-2 pr-4 font-semibold cursor-help tooltip">
                            <span class="icon-[tabler--heart] size-6"></span>
                            {mod()?.data.likes}
                            <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                                <span class="tooltip-body">喜爱数</span>
                            </span>
                        </div>
                        <div class="hidden items-center gap-2 md:flex">
                            <span class="icon-[tabler--article] size-6"></span>
                            <div class="flex flex-wrap gap-2">
                                <div class="bg-base-200 px-2 py-1 leading-none rounded-full font-semibold text-sm inline-flex items-center gap-1 [&>svg]:shrink-0 [&>svg]:h-4 [&>svg]:w-4 border-none transition-transform active:scale-[0.95]  hover:underline">
                                    {mod()?.data.game.name}
                                </div>
                                <div class="bg-base-200 px-2 py-1 leading-none rounded-full font-semibold text-sm inline-flex items-center gap-1 [&>svg]:shrink-0 [&>svg]:h-4 [&>svg]:w-4 border-none transition-transform active:scale-[0.95] hover:underline">
                                    {mod()?.data.category}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 items-center ml-auto">
                    <button class="btn btn-primary min-w-25 btn-lg" onClick={() => { HSTabs.open(download!) }}>
                        <span class="icon-[tabler--download] size-6"></span>
                        下载
                    </button>
                    <button class="btn btn-circle btn-soft btn-primary btn-lg" aria-label="Circle Soft Icon Button">
                        <span class="icon-[tabler--heart] size-6" classList={{ "icon-[tabler--heart-filled]": checkIsLike()?.data }} onClick={handleLike}></span>
                    </button>
                    <button class="btn btn-circle btn-soft btn-primary btn-lg" aria-label="Circle Soft Icon Button">
                        <span class="icon-[tabler--star] size-6" classList={{ "icon-[tabler--star-filled]": checkIsFavorite()?.data }} onClick={handleFavorite}></span>
                    </button>
                    <div class="dropdown relative inline-flex rtl:[--placement:bottom-end]">
                        <button id="dropdown-menu-icon" type="button" class="dropdown-toggle btn btn-circle btn-lg bg-base-100 shadow-none border-none" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                            <span class="icon-[tabler--dots-vertical] size-6"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-open:opacity-100 hidden min-w-36" role="menu" aria-orientation="vertical" aria-labelledby="dropdown-menu-icon">
                            <li>
                                <a class="dropdown-item text-error hover:cursor-pointer" aria-haspopup="dialog" aria-expanded="false" aria-controls="focus-modal" onClick={() => {
                                    if (!useAuthStore().isLogin()) {
                                        modal.close()
                                        navigate("/login")
                                    } else {
                                        modal.open()
                                        setReport("type", "mod")
                                    }
                                }
                                }>
                                    <span class="icon-[tabler--flag] size-5"></span>
                                    举报
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div id="focus-modal" class="overlay modal overlay-open:opacity-100 hidden [--has-autofocus:false] --prevent-on-load-init" role="dialog" tabindex="-1" >
                        <div class="modal-dialog overlay-open:opacity-100">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h3 class="modal-title">举报</h3>
                                    <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" data-overlay="#focus-modal" >
                                        <span class="icon-[tabler--x] size-4"></span>
                                    </button>
                                </div>
                                <form onSubmit={handleModSubmit}>
                                    <div class="modal-body pt-0">
                                        <div class="mb-4">
                                            <label class="label label-text" for="type">类型</label>
                                            <input type="text" class="input" id="type" value={report.type === "mod" ? "模组" : "评论"} disabled />
                                        </div>
                                        <div class="mb-0.5">
                                            <label class="label label-text" for="reason">原因</label>
                                            <select class="select" id="reason" onInput={(e) => setReport("reason", e.target.value)}>
                                                <option>侵权</option>
                                                <option>病毒</option>
                                                <option>广告</option>
                                                <option>色情内容</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-soft btn-secondary" data-overlay="#focus-modal">关闭</button>
                                        <button type="submit" class="btn btn-primary">提交</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-row">
                <div class="flex flex-col w-full mr-3">
                    <div class="overflow-x-auto mt-5">
                        <nav class="tabs bg-base-200 rounded-btn w-fit space-x-1 overflow-x-auto p-1 rtl:space-x-reverse" aria-label="Tabs" role="tablist" aria-orientation="horizontal" >
                            <button type="button" class="btn btn-text active-tab:bg-primary active-tab:text-white hover:text-primary active hover:bg-transparent" id="tabs-segment-item-1" data-tab="#tabs-segment-1" aria-controls="tabs-segment-1" role="tab" aria-selected="true" >
                                描述
                                {mod()?.data.user.id}
                            </button>
                            <button type="button" class="btn btn-text active-tab:bg-primary active-tab:text-white hover:text-primary hover:bg-transparent" id="tabs-segment-item-2" data-tab="#tabs-segment-2" aria-controls="tabs-segment-2" role="tab" aria-selected="false" >
                                评论
                            </button>
                            <button type="button" class="btn btn-text active-tab:bg-primary active-tab:text-white hover:text-primary hover:bg-transparent" id="tabs-segment-item-3" data-tab="#tabs-segment-3" aria-controls="tabs-segment-3" role="tab" aria-selected="false">
                                更新日志
                            </button>
                            <button type="button" class="btn btn-text active-tab:bg-primary active-tab:text-white hover:text-primary hover:bg-transparent" id="tabs-segment-item-4" data-tab="#tabs-segment-4" aria-controls="tabs-segment-4" role="tab" aria-selected="false" ref={download}>
                                版本
                            </button>
                        </nav>

                        <div class="mt-3">
                            <div id="tabs-segment-1" role="tabpanel" aria-labelledby="tabs-segment-item-1">
                                <div class="prose max-w-4xl" innerHTML={html()}></div>
                            </div>
                            <div id="tabs-segment-2" class="hidden" role="tabpanel" aria-labelledby="tabs-segment-item-2">
                                <CommentPage />
                            </div>
                            <div id="tabs-segment-3" class="hidden" role="tabpanel" aria-labelledby="tabs-segment-item-3">
                                <ul class="timeline timeline-vertical timeline-compact w-9/12">
                                    <For each={modVersions()?.data.list.reverse()}>
                                        {(item) =>
                                            <li>
                                                <div class="timeline-start text-base-content font-medium">
                                                    {item.version}
                                                    <span class="m-2">{format(new Date(item.created_at), "yyyy-MM-dd")}</span>
                                                </div>
                                                <div class="timeline-middle">
                                                    <span class="bg-primary/20 flex size-4.5 items-center justify-center rounded-full">
                                                        <span class="badge badge-primary size-3 rounded-full p-0"></span>
                                                    </span>
                                                </div>
                                                <div class="timeline-end timeline-box">{item.change_log}</div>
                                                <hr />
                                            </li>
                                        }
                                    </For>
                                </ul>
                            </div>
                            <div id="tabs-segment-4" class="hidden" role="tabpanel" aria-labelledby="tabs-segment-item-4">
                                <VersionsTable data={modVersions} userID={mod()?.data.user.ID} reload={reload} setReload={setReload} />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col ml-auto gap-4">
                    <div class="card sm:max-w-sm gap-4 p-5">
                        <h5 class="card-title">
                            创作者
                        </h5>
                        <div class="flex gap-4">
                            <div class="avatar">
                                <div class="size-8 rounded-full">
                                    <A href={`/user/${mod()?.data.user.user_name}`} class="my-auto" target="_blank">
                                        <img src={mod()?.data.user.user_profile.avatar_file.url} alt="avatar" />
                                    </A>
                                </div>
                            </div>
                            <A href={`/user/${mod()?.data.user.user_name}`} target="_blank" class="my-auto">{mod()?.data.user.user_name}</A>
                        </div>
                    </div>
                    <div class="card sm:max-w-xs">
                        <div class="card-header">
                            <h5 class="card-title">详情</h5>
                        </div>
                        <div class="card-body w-64 gap-4">
                            <DateDisplay date={updateTime}>
                                <span class="icon-[tabler--calendar-month] size-6"></span>
                                <p>更新于</p>
                            </DateDisplay>
                            <DateDisplay date={createTime}>
                                <span class="icon-[tabler--timeline-event] size-6"></span>
                                <p>发布于</p>
                            </DateDisplay>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModDetails