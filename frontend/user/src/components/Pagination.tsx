import { Component, For } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { useI18nContext } from "../context/I18nContext";

type PaginationProps = {
    currentPage: number,
    totalPages: number,
    setPage: SetStoreFunction<Paging>
}
export const Pagination: Component<PaginationProps> = (props) => {
    const { t } = useI18nContext()

    const getVisiblePages = () => {
        const pages = []
        const current = props.currentPage
        const total = props.totalPages

        // 始终添加第一页
        pages.push(1)

        // 计算中间页码范围
        let start = Math.max(2, current - 1)
        let end = Math.min(total - 1, current + 1)

        // 调整起始位置
        if (current <= 3) {
            end = Math.min(4, total);
        } else if (current >= total - 2) {
            start = Math.max(total - 3, 2)
        }

        // 添加左边省略号
        if (start > 2) pages.push("...")

        // 添加中间页码
        for (let i = start; i <= end; i++) {
            if (i > 1 && i < total) pages.push(i)
        }

        // 添加右边省略号
        if (end < total - 1) pages.push("...")

        // 添加最后一页（总页数>1时）
        if (total > 1) pages.push(total)

        return pages
    }

    return (
        <nav class="flex items-center gap-x-1">
            <button type="button" class="btn btn-soft max-sm:btn-square" classList={{ "btn-disabled": props.currentPage === 1 }}
                onClick={() => props.setPage("page", props.currentPage - 1)}>
                <span class="icon-[tabler--chevron-left] size-5 rtl:rotate-180 sm:hidden"></span>
                <span class="hidden sm:inline">{t("page.previous")}</span>
            </button>
            <div class="flex items-center gap-x-1">
                <For each={getVisiblePages()}>
                    {(page) => (
                        typeof page === "number" ? (
                            <button
                                type="button"
                                class="btn btn-soft btn-square aria-[current='page']:text-bg-soft-primary"
                                aria-current={page === props.currentPage ? "page" : undefined}
                                onClick={() => props.setPage("page", page)}>
                                {page}
                            </button>
                        ) : (
                            <div class="tooltip inline-block">
                                <button type="button" class="tooltip-toggle tooltip-toggle btn btn-soft btn-square group cursor-default" aria-label="More Pages">
                                    <span class="icon-[tabler--dots] size-5"></span>
                                </button>
                            </div>
                        )
                    )}
                </For>
            </div>
            <button type="button" class="btn btn-soft max-sm:btn-square" classList={{ "btn-disabled": props.currentPage === props.totalPages }} onClick={() => props.setPage("page", props.currentPage + 1)}>
                <span class="hidden sm:inline">{t("page.next")}</span>
                <span class="icon-[tabler--chevron-right] size-5 rtl:rotate-180 sm:hidden"></span>
            </button>
        </nav>
    )
}