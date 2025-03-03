import { OutputData } from "@editorjs/editorjs";
import { A, createAsync } from "@solidjs/router";
import { format } from "date-fns";
import { HSOverlay } from "flyonui/flyonui";
import { createEffect, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { deleteModAPI, getModsAPI, updateModAPI } from "../api/mod";
import { createModVersion } from "../api/mod_version";
import { Editor } from "../components/Editor";
import { FileUpload } from "../components/FileUpload";
import { Pagination } from "../components/Pagination";
import { Search } from "../components/Search";
import { useI18nContext } from "../context/I18nContext";
import { useNotifyContext } from "../context/NotifyContext";
import { useAuthStore } from "../stores/auth";
import { ModQuery, updateModRequest } from "../types/mod";
import { CreateModVersionRequest } from "../types/mod_version";
import { formatNumber } from "../utils/numberFormat";

const MyMod = () => {
    const { t } = useI18nContext()
    const notify = useNotifyContext()
    const [modQuery, setModQuery] = createStore<ModQuery>({
        name: "",
        status: "",
        sort: "name",
        order: "",
        page: 1,
        page_size: 10,
        category: [],
        gameID: 0,
        userID: useAuthStore().profile()?.id,
        needContent: true,
    })
    // eslint-disable-next-line no-unused-vars
    const [totalDownloads, setTotalDownloads] = createSignal(0)
    // eslint-disable-next-line no-unused-vars
    const [totalLikes, setTotalLikes] = createSignal(0)
    const [reload, setReload] = createSignal(false)
    let flag = true
    const [editorData, setEditorData] = createSignal<OutputData>()
    const [updateInput, setUpdateInput] = createStore<updateModRequest>({
        content: "",
        description: ""
    })
    const [total, setTotal] = createSignal(0)
    let totalFlag = true
    let modal: HSOverlay

    const [isSubmit, setIsSubmit] = createSignal(false)
    const [checkModFile, setCheckModFile] = createSignal(false)
    const [isModUpFinish, setIsModUpFinish] = createSignal(false)
    const [fileID, setFileID] = createSignal(0)
    const [modVersionInput, setModVersionInput] = createStore<CreateModVersionRequest>({
        version: "",
        change_log: "",
        mod_id: 0,
        file_id: 0
    })
    const [modID, setModID] = createSignal(0)

    const myModList = createAsync(() => getModsAPI(modQuery, reload()))

    onMount(() => {
        setTimeout(() => {
            window.HSStaticMethods.autoInit()
        }, 500)
        modal = new HSOverlay(document.querySelector('#form-modal')!)
        return () => {
            modal.destroy()
        }
    })

    createEffect(async () => {
        if (editorData()) {
            setUpdateInput("content", JSON.stringify(editorData()))
        }

        if (isModUpFinish()) {
            setModVersionInput("file_id", fileID())
            try {
                await createModVersion(modVersionInput)
                modal.close()
                notify.success("发布更新成功")
                setModVersionInput({
                    version: "",
                    change_log: "",
                    mod_id: 0,
                    file_id: 0
                })
            } catch (e) {
                modal.close()
                console.log(e)
                notify.error("更新失败")
            }
        }

        if (myModList()?.data.total && totalFlag) {
            setTotal(myModList()!.data.total)
            totalFlag = false
        }
    })

    const totalPage = createMemo(() => {
        const total = myModList()?.data.total ?? 0
        const pageSize = modQuery.page_size
        return Math.ceil(total / pageSize!)
    })

    // 删除确认
    const confirmDelete = async (modID: number) => {
        if (confirm("确定要删除这个模组吗？此操作不可撤销！")) {
            try {
                await deleteModAPI(modID)
                notify.success("删除成功")
                setReload(!reload())
            } catch (error) {
                notify.error("删除失败" + error)
            }
        }
    }

    // 状态徽章颜色
    const statusBadge = (status: string) => {
        const colors = {
            enable: "badge-success",
            pending: "badge-warning",
            disable: "badge-error",
        };
        return (status in colors ? colors[status as keyof typeof colors] : "badge-neutral");
    }

    const submitContent = async (id: number) => {
        try {
            await updateModAPI(id, updateInput)
            notify.success("更新成功")
        } catch (error) {
            notify.error("更新失败" + error)
        }
    }

    const releaseNewVersion = () => {
        if (modVersionInput.version === "") {
            notify.error("请输入版本")
        } else if (modVersionInput.change_log === "") {
            notify.error("请输入更新日志")
        } else if (!checkModFile()) {
            notify.error("请上传符合要求的文件")
        } else {
            setModVersionInput("mod_id", modID())
            setIsSubmit(true)
        }
    }

    return (
        <div class="m-auto bg-base-200">
            <div class="min-h-screen p-4 md:p-8 w-screen">
                <div class="container mx-auto">
                    {/* 标题和操作区 */}
                    <div class="flex flex-col md:flex-row justify-between mb-8 gap-4">
                        <div>
                            <h1 class="text-3xl font-bold">我的模组</h1>
                            <p class="text-gray-500 mt-2">共管理 {total()} 个模组</p>
                        </div>
                        <A href="/create-mod" class="btn btn-primary">
                            新建模组
                        </A>
                    </div>

                    {/* 控制栏 */}
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Search setter={setModQuery} key="name" delay={400} placeholder={t('searchPlaceholder')} />
                        <select
                            class="select select-bordered"
                            value={modQuery.status}
                            onChange={(e) => setModQuery("status", e.target.value)}
                        >
                            <option value="">所有状态</option>
                            <option value="enable">已发布</option>
                            <option value="pending">待审核</option>
                            <option value="disable">已下架</option>
                        </select>

                        <select
                            class="select select-bordered"
                            value={modQuery.sort}
                            onChange={(e) => setModQuery("sort", e.target.value)}
                        >
                            <option value="name">按名称</option>
                            <option value="last_update">按更新日期</option>
                            <option value="total_downloads">按下载量</option>
                            <option value="likes">按点赞数</option>
                        </select>
                    </div>

                    {/* 统计卡片 */}
                    <div class="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                        <div class="stat bg-base-100 rounded-lg p-4">
                            <div class="stat-title">总下载量</div>
                            <div class="stat-value text-primary">{formatNumber(totalDownloads())}</div>
                        </div>
                        <div class="stat bg-base-100 rounded-lg p-4">
                            <div class="stat-title">收到的赞</div>
                            <div class="stat-value text-accent">{formatNumber(totalLikes())}</div>
                        </div>
                    </div>

                    {/* 模组列表 */}
                    <div class="grid grid-cols-1 gap-4">
                        <For each={myModList()?.data.list}>
                            {(mod) => (
                                flag === true && (
                                    setTotalDownloads(totalDownloads() + mod.total_downloads),
                                    setTotalLikes(totalLikes() + mod.likes),
                                    flag = false
                                ),
                                <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                                    <div class="card-body">
                                        <div class="flex flex-col md:flex-row gap-4 items-start">
                                            {/* 图标和基本信息 */}
                                            <div class="shrink-0">
                                                <A href={`/games/${mod.game.id}/mods/${mod.id}`}>
                                                    <img
                                                        src={mod.cover_file.url}
                                                        class="w-24 h-24 rounded-lg object-cover"
                                                        alt="模组图标"
                                                    />
                                                </A>
                                            </div>
                                            {/* 主要内容 */}
                                            <div class="flex-1">
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <A href={`/games/${mod.game.id}/mods/${mod.id}`}>
                                                        <h2 class="text-xl font-bold">{mod.name}</h2>
                                                    </A>
                                                    <div class={`badge ${statusBadge(mod.status)}`}>
                                                        {mod.status === "enable" ? "已发布" :
                                                            mod.status === "pending" ? "待审核" : "已下架"}
                                                    </div>
                                                </div>
                                                <p class="mt-2 text-gray-600 line-clamp-2">
                                                    {mod.description}
                                                </p>
                                                <div class="flex flex-wrap gap-4 mt-4 text-sm">
                                                    <div class="flex items-center gap-1">
                                                        下载量：{formatNumber(mod.total_downloads)}
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        点赞：{formatNumber(mod.likes)}
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        最后更新：{format(new Date(mod.last_update), "yyyy-MM-dd")}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 操作按钮 */}
                                            <div class="flex flex-col gap-2 md:w-40">
                                                <Editor class="btn btn-sm btn-outline" setEditorData={setEditorData} EditorData={JSON.parse(mod.content)} >
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-primary" onClick={() => submitContent(mod.id)} data-overlay="#text-editor-modal">提交</button>
                                                    </div>
                                                </Editor>
                                                <button type="button" class="btn btn-sm btn-outline btn-success" aria-haspopup="dialog" aria-expanded="false" aria-controls="form-modal" data-overlay="#form-modal" onClick={
                                                    () => {
                                                        modal.open()
                                                        setModID(mod.id)
                                                    }}>更新</button>
                                                <button
                                                    class="btn btn-sm btn-error btn-outline"
                                                    onClick={() => confirmDelete(mod.id)}
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>
                        <div id="form-modal" class="overlay modal overlay-open:opacity-100 hidden --prevent-on-load-init" role="dialog" tabindex="-1">
                            <div class="modal-dialog overlay-open:opacity-100">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h3 class="modal-title">更新版本</h3>
                                        <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" data-overlay="#form-modal"><span class="icon-[tabler--x] size-4"></span></button>
                                    </div>
                                    <div class="modal-body pt-0">
                                        <div class="w-full sm:w-96">
                                            <label class="label label-text" for="textareaHelperTextDefault">更新版本号</label>
                                            <input type="text" class="input input-bordered mb-5" onChange={(e) => { setModVersionInput("version", e.target.value) }} />
                                            <label class="label label-text" for="textareaHelperTextDefault">更新日志</label>
                                            <textarea class="textarea mb-5" maxlength={100} onChange={(e) => { setModVersionInput("change_log", e.target.value) }}></textarea>
                                        </div>
                                        <FileUpload setCheck={setCheckModFile} isSubmit={isSubmit} setFinish={setIsModUpFinish} check={checkModFile} setFileID={setFileID} />
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-primary" onClick={releaseNewVersion}>发布</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 空状态提示 */}
                    <Show when={myModList()?.data.list.length === 0}>
                        <div class="text-center py-16">
                            <div class="text-4xl mb-4">📭</div>
                            <p class="text-xl font-bold mb-2">还没有创建任何模组</p>
                            <p class="text-gray-500 mb-4">点击右上角按钮开始创建你的第一个模组</p>
                        </div>
                    </Show>
                </div >
            </div >
            <Show when={myModList()?.data.total !== 0 || undefined}>
                <div class="m-auto flex bg-base-200 justify-center mb-5">
                    <Pagination currentPage={modQuery.page!} totalPages={totalPage()} setPage={setModQuery} />
                </div>
            </Show>
        </div >
    );
};

export default MyMod