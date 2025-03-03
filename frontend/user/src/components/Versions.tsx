import { AccessorWithLatest, reload, useParams } from '@solidjs/router'
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Accessor, Component, createMemo, createSignal, For, Setter, Show } from 'solid-js'
import { DOMElement } from 'solid-js/jsx-runtime'
import { deleteModVersion, updateCount } from '../api/mod_version'
import { useNotifyContext } from '../context/NotifyContext'
import { useAuthStore } from '../stores/auth'
import { ModVersionList } from '../types/mod_version'
import { byteFormat } from '../utils/byteFormat'
import { formatNumber } from '../utils/numberFormat'

export const VersionsTable: Component<{
    data: AccessorWithLatest<ApiResponse<ModVersionList> | undefined>
    userID: number | undefined
    setReload: Setter<boolean>
    reload: Accessor<boolean>
}> = (props) => {
    const [sortConfig, setSortConfig] = createSignal<{
        key: 'published' | 'downloads'
        direction: 'asc' | 'desc'
    }>({ key: 'published', direction: 'desc' })

    const params = useParams()
    const authStore = useAuthStore()
    const notify = useNotifyContext()

    const handleClick = async (e: MouseEvent & {
        currentTarget: HTMLAnchorElement;
        target: DOMElement;
    }, id: number) => {
        e.preventDefault()
        const fileUrl = e.currentTarget.href
        try {
            await updateCount(params.id, id)
            const link = document.createElement('a')
            link.href = fileUrl
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Error updating count:', error);
        }
    }

    // 排序逻辑
    const sortedVersions = createMemo(() => {
        const items = props.data()?.data.list || []
        return [...items].sort((a, b) => {
            const sortKey = sortConfig().key
            const modifier = sortConfig().direction === 'asc' ? 1 : -1

            if (sortKey === 'published') {
                return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier
            }

            return (a.downloads - b.downloads) * modifier
        })
    })

    // 处理排序点击
    const requestSort = (key: 'published' | 'downloads') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }))
    }

    const confirmDelete = async (id: number) => {
        if (confirm("确定要删除这个模组吗？此操作不可撤销！")) {
            try {
                await deleteModVersion(id)
                notify.success("删除成功")
                props.setReload(!reload())
            } catch (error) {
                notify.error("删除失败" + error)
            }
        }
    }

    return (
        <div class="max-w-4xl">
            {/* 排序控制 */}
            <div class="flex justify-end mb-4 gap-2">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">排序方式：</span>
                    </label>
                    <div class="flex gap-2">
                        <button
                            class="btn btn-sm"
                            classList={{
                                'btn-primary': sortConfig().key === 'published',
                                'btn-ghost': sortConfig().key !== 'published'
                            }}
                            onClick={() => requestSort('published')}
                        >
                            更新时间
                            <Show when={sortConfig().key === 'published'}>
                                {sortConfig().direction === 'asc' ? '↑' : '↓'}
                            </Show>
                        </button>
                        <button
                            class="btn btn-sm"
                            classList={{
                                'btn-primary': sortConfig().key === 'downloads',
                                'btn-ghost': sortConfig().key !== 'downloads'
                            }}
                            onClick={() => requestSort('downloads')}
                        >
                            下载量
                            <Show when={sortConfig().key === 'downloads'}>
                                {sortConfig().direction === 'asc' ? '↑' : '↓'}
                            </Show>
                        </button>
                    </div>
                </div>
            </div>

            <div class='w-full border rounded-lg border-base-content/25'>
                <table class="table">
                    <thead>
                        <tr>
                            <th class="w-2/12">版本</th>
                            <th class="w-2/12">发布时间</th>
                            <th class="w-2/12">文件大小</th>
                            <th class="w-2/12">下载量</th>
                            <th class="w-1/12"></th>
                            <Show when={authStore.profile()?.id === props.userID}>
                                <th class="w-1/12"></th>
                            </Show>
                        </tr>
                    </thead>

                    <tbody>
                        <For each={sortedVersions()}>
                            {(version) => (
                                <tr class="hover:bg-base-200 transition-colors">
                                    {/* 版本号 */}
                                    <td class="font-mono">{version.version}</td>

                                    {/* 更新时间 */}
                                    <td class="text-md">
                                        <div class="tooltip flex">
                                            <div class="tooltip-toggle flex items-center justify-center gap-2" aria-label="Tooltip">
                                                {
                                                    formatDistanceToNow(new Date(version.created_at), {
                                                        addSuffix: true,
                                                        locale: zhCN,
                                                    })
                                                }
                                            </div>
                                            <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                                                <span class="tooltip-body">{format(new Date(version.created_at), "yyyy-MM-dd HH:mm")}</span>
                                            </span>
                                        </div>
                                    </td>
                                    {/* 文件大小 */}
                                    <td>
                                        {byteFormat(version.file.file_size)}
                                    </td>

                                    {/* 下载量 */}
                                    <td class="font-medium">{formatNumber(version.downloads)}</td>

                                    {/* 下载按钮 */}
                                    <td>
                                        <div class="join join-vertical">
                                            <a
                                                href={version.file.url}
                                                class="btn btn-primary btn-sm"
                                                download={version.file.file_name}
                                                onClick={(e) => handleClick(e, version.id)}
                                            >
                                                <span class='icon-[tabler--download] size-5'></span>
                                            </a>
                                        </div>
                                    </td>
                                    <Show when={authStore.profile()?.id === props.userID}>
                                        <td >
                                            <button class='btn btn-sm btn-error' onClick={() => confirmDelete(version.id)}>删除</button>
                                        </td>
                                    </Show>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
            </div>
        </div>
    )
}