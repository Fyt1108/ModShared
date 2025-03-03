import { Component } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

type SearchProps = {
    setter: SetStoreFunction<any>
    class?: string
    key: string
    delay: number
    placeholder: string
}
export const Search: Component<SearchProps> = (props) => {
    const debounce = (fn: Function, delay: number) => {
        let timeoutId: number;
        return (...args: any[]) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => fn(...args), delay);
            return () => clearTimeout(timeoutId); // 返回取消函数
        }
    }

    const debouncedSearch = debounce((term: string) => {
        props.setter(props.key, term)
    }, props.delay)

    return (
        <label class="input-group hidden max-w-56 rounded-full md:flex">
            <span class="input-group-text">
                <span class="icon-[tabler--search] text-base-content/80 size-5"></span>
            </span>
            <input type="search" class={props.class ? props.class : "input grow rounded-e-full max-w-52"}
                placeholder={props.placeholder}
                onInput={(event) => debouncedSearch(event.target.value)} />
        </label>
    )
}