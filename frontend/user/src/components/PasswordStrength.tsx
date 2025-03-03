import { Component } from "solid-js"

type PasswordStrengthProps = {
    target: string
    translator: any
}

export const PasswordStrength: Component<PasswordStrengthProps> = (props) => {
    const t = props.translator

    return (
        <div id="password-content" class="card absolute z-10 w-full hidden p-4">
            <div data-strong-password={JSON.stringify({
                target: `${props.target}`,
                hints: "#password-content",
                stripClasses: "strong-password:opacity-100 strong-password-accepted:bg-teal-500 h-2 flex-auto rounded-full bg-primary opacity-40 mx-1",
                mode: "popover",
                checksExclude: "special-characters"
            })} class="-mx-1 mt-2.5 flex">
            </div>
            <h6 class="text-base text-base-content my-2 font-semibold">{t('auth.passwordCheckTips')}
            </h6>
            <ul class="text-base-content/80 space-y-1 text-sm">
                <li data-pw-strength-rule="min-length"
                    class="strong-password-active:text-success flex items-center gap-x-2">
                    <span class="icon-[tabler--circle-check] hidden size-5 flex-shrink-0"
                        data-check></span>
                    <span class="icon-[tabler--circle-x] hidden size-5 flex-shrink-0"
                        data-uncheck></span>
                    {t('auth.passwordCheckMin')}
                </li>
                <li data-pw-strength-rule="lowercase"
                    class="strong-password-active:text-success flex items-center gap-x-2">
                    <span class="icon-[tabler--circle-check] hidden size-5 flex-shrink-0"
                        data-check></span>
                    <span class="icon-[tabler--circle-x] hidden size-5 flex-shrink-0"
                        data-uncheck></span>
                    {t('auth.passwordCheckLower')}
                </li>
                <li data-pw-strength-rule="uppercase"
                    class="strong-password-active:text-success flex items-center gap-x-2">
                    <span class="icon-[tabler--circle-check] hidden size-5 flex-shrink-0"
                        data-check></span>
                    <span class="icon-[tabler--circle-x] hidden size-5 flex-shrink-0"
                        data-uncheck></span>
                    {t('auth.passwordCheckUpper')}
                </li>
                <li data-pw-strength-rule="numbers"
                    class="strong-password-active:text-success flex items-center gap-x-2">
                    <span class="icon-[tabler--circle-check] hidden size-5 flex-shrink-0"
                        data-check></span>
                    <span class="icon-[tabler--circle-x] hidden size-5 flex-shrink-0"
                        data-uncheck></span>
                    {t('auth.passwordCheckNum')}
                </li>
            </ul>
        </div>
    )
}