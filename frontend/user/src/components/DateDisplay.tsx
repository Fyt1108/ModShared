import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Accessor, createMemo, ParentComponent } from "solid-js";

type DateDisplayProps = {
    date: Accessor<Date>
}

export const DateDisplay: ParentComponent<DateDisplayProps> = (props) => {
    // 格式化完整日期时间
    const fullDate = createMemo(() => format(props.date(), "yyyy-MM-dd HH:mm"))

    // 格式化相对时间
    const relativeTime = createMemo(() => formatDistanceToNow(props.date(), {
        addSuffix: true,
        locale: zhCN,
    }))

    return (
        <div class="tooltip flex">
            <div class="tooltip-toggle flex items-center justify-center gap-2" aria-label="Tooltip">
                {props.children}
                {relativeTime()}
            </div>
            <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                <span class="tooltip-body">{fullDate()}</span>
            </span>
        </div>
    )
}