import { Component, createSelector, For } from "solid-js"
import { useI18nContext } from "../context/I18nContext"


export const I18nButton: Component = () => {
    const { locale, setLocale, locales } = useI18nContext()
    const isSelected = createSelector(locale)

    return (
        <div class="dropdown relative inline-flex rtl:[--placement:bottom-end]">
            <button id="dropdown-default" type="button" class="dropdown-toggle btn btn-text btn-circle dropdown-open:bg-base-content/10 size-10" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                <span class="icon-[tabler--language] size-7"></span>
            </button>
            <ul class="dropdown-menu dropdown-open:opacity-100 hidden min-w-40" role="menu" aria-orientation="vertical" aria-labelledby="dropdown-default">
                <For each={Object.entries(locales)}>
                    {([key, value]) =>
                        <li><button class="dropdown-item" classList={{ "active": isSelected(key as any) }} onClick={() => setLocale(key as any)} >{value}</button></li>
                    }
                </For>
            </ul>
        </div>
    )
}