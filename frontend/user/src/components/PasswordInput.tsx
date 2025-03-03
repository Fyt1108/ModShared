import { Component } from "solid-js";

type PasswordInputProps = {
    onInput: (event: InputEvent & {
        currentTarget: HTMLInputElement
        target: HTMLInputElement
    }) => void
    id: string
    placeholder: string
}

export const PasswordInput: Component<PasswordInputProps> = (props) => {
    return (
        <>
            <input name={props.id} type="password" class="input grow"
                placeholder={props.placeholder} id={props.id} required
                onInput={props.onInput} maxlength="20" />
            <span class="input-group-text">
                <button type="button" data-toggle-password={JSON.stringify({
                    target: `#${props.id}`
                })
                } class="block">
                    <span
                        class="icon-[tabler--eye] text-base-content/80 password-active:block hidden size-4 flex-shrink-0"></span>
                    <span
                        class="icon-[tabler--eye-off] text-base-content/80 password-active:hidden block size-4 flex-shrink-0"></span>
                </button>
            </span>
        </>
    )
}