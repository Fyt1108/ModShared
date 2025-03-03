import { Accessor, Component, createEffect, createMemo, createSignal, Setter, Show } from "solid-js"

type TimerButtonProps = {
    onClick: (event: MouseEvent) => void
    start: Accessor<boolean>
    setStart: Setter<boolean>
    text: string
    class?: string
    icon?: string
}

export const TimerButton: Component<TimerButtonProps> = (props) => {
    const [countdownTime, setCountdownTime] = createSignal(60)
    const [isCountingDown, setIsCountingDown] = createSignal(false)
    const buttonText = createMemo(() => isCountingDown() ? `${countdownTime()}s` : props.text)

    createEffect(() => {
        if (props.start()) {
            startCountdown()
            props.setStart(false)
        }
    })

    const startCountdown = () => {
        if (isCountingDown()) return

        setIsCountingDown(true)

        const countdownInterval = setInterval(() => {
            if (countdownTime() > 0) {
                setCountdownTime(countdownTime() - 1)
            } else {
                clearInterval(countdownInterval)
                setIsCountingDown(false)
                setCountdownTime(60)
            }
        }, 1000)
    }

    return (
        <button class={`btn ${props.class}`} onClick={props.onClick} type="button" disabled={isCountingDown()} >
            <Show when={props.icon}>
                <span class={`${props.icon} size-5`} ></span >
            </Show>
            <p>{buttonText()}</p>
        </button >
    )
}