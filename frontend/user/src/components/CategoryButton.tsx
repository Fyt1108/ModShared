import { Component, createSignal } from "solid-js"

type CategoryButtonProps = {
    icon?: string,
    text: string,
    click?: Function
}

export const CategoryButton: Component<CategoryButtonProps> = (props) => {
    const [isChecked, setIsChecked] = createSignal(false)
    const [isHovered, setIsHovered] = createSignal(false)

    const handleClick = () => {
        setIsChecked(!isChecked())
        if (props.click) {
            props.click()
        }
    }

    return (
        <button class="btn w-full lg:w-52 relative group"
            classList={{ 'btn-success': isChecked() }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)} >
            <span class={props.icon}></span>
            <p>{props.text}</p>
            <span class="icon-[tabler--check] ml-auto transition-opacity duration-200"
                classList={{
                    'opacity-0': !isChecked() && !isHovered(),
                    'opacity-100': isChecked() || isHovered()
                }}></span>
        </button>
    )
}