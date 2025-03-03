import { createAsync, useNavigate } from "@solidjs/router";
import HSFileUpload from "flyonui/dist/js/file-upload";
import { ICollectionItem } from "flyonui/flyonui";
import { Component, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { apiUrl } from "../api";
import { getUserBySelfAPI, updateUserProfileAPI } from "../api/user";
import { useI18nContext } from "../context/I18nContext";
import { useNotifyContext } from "../context/NotifyContext";
import { UpdateUserProfileRequest } from "../types/user";
import { getToken } from "../utils/token";

const ProfileSettings: Component = () => {
    const { t } = useI18nContext()
    const notify = useNotifyContext()
    const userData = createAsync(() => getUserBySelfAPI())
    const navigate = useNavigate()

    const [profileInput, setProfileInput] = createStore<UpdateUserProfileRequest>({
        old_avatar_id: 0,
        new_avatar_id: 0,
        description: "",
    })

    const [check, setCheck] = createSignal(true)
    const [finish, setFinish] = createSignal(false)
    const [avatarChange, setAvatarChange] = createSignal(false)
    let flag = true
    let dropzone: any

    createEffect(async () => {
        if (userData() && flag) {
            setProfileInput("description", userData()!.data.user_profile.description)
            setProfileInput("old_avatar_id", userData()!.data.user_profile.avatar_id)
            setProfileInput("new_avatar_id", userData()!.data.user_profile.avatar_id)
            flag = false
        }

        if (finish()) {
            try {
                await updateUserProfileAPI(profileInput)
                notify.success(t("saveSuccess"))
                setTimeout(() => {
                    navigate("/my-profile")
                }, 1500)
            } catch (e) {
                notify.error(e)
            }
        }
    })

    onMount(() => {
        HSFileUpload.autoInit()
        const { element } = HSFileUpload.getInstance('#avatar-upload', true) as ICollectionItem<HSFileUpload>
        dropzone = element.dropzone

        dropzone.on("error", (file: any, _response: any) => {
            setCheck(false)
            //@ts-ignore
            if (file.size > element.concatOptions.maxFilesize * 1024 * 1024) {
                notify.error(t("fileUpload.coverSize"))
            }
        })

        dropzone.on("addedfile", () => {
            setCheck(true)
            setAvatarChange(true)
        })

        dropzone.on("success", (_file: any, response: any) => {
            setProfileInput("new_avatar_id", response.data.file_id)
            setFinish(true)
        })

        return () => {
            element.destroy()
        }
    })

    const handleClick = () => {
        if (avatarChange()) {
            dropzone.processQueue()
        } else {
            setFinish(true)
        }
    }

    return (
        <div class="m-auto">
            <div class="min-h-screen w-screen  p-4 md:p-8">
                <div class="container mx-auto max-w-3xl">
                    <h1 class="text-3xl font-bold mb-8">{t("profileSetting.setting")}</h1>
                    <form class="space-y-6">
                        {/* 头像上传 */}
                        <div class="card bg-base-100 shadow-lg">
                            <div class="card-body">
                                <div
                                    id="avatar-upload"
                                    data-file-upload={JSON.stringify({
                                        url: `${apiUrl}/upload/file?type=user_avatar`,
                                        autoProcessQueue: false,
                                        resizeWidth: 128,
                                        resizeHeight: 128,
                                        resizeQuality: 0.9,
                                        thumbnailWidth: 128,
                                        thumbnailHeight: 128,
                                        acceptedFiles: "image/*",
                                        maxFiles: 1,
                                        singleton: true,
                                        maxFilesize: 2,
                                        headers: {
                                            Authorization: `Bearer ${getToken()}`
                                        }
                                    })} >
                                    <template data-file-upload-preview="">
                                        <div class="size-32">
                                            <img class="w-full rounded-full object-contain" data-dz-thumbnail="" />
                                        </div>
                                    </template>

                                    <div class="flex flex-wrap items-center gap-3 sm:gap-5">
                                        <div class="group" data-file-upload-previews="" data-file-upload-pseudo-trigger="">
                                            <span class="border-base-content/30 text-base-content/50 flex size-32 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-dotted hover:bg-base-200/60 group-has-[div]:hidden overflow-hidden" >
                                                <img class="h-full object-cover" src={userData()?.data.user_profile.avatar_file.url} alt="" />
                                            </span>
                                        </div>
                                        <div class="grow">
                                            <div class="flex items-center gap-x-2">
                                                <button type="button" class="btn btn-primary" data-file-upload-trigger="">
                                                    <span class="icon-[tabler--upload] size-4 shrink-0"></span>
                                                    上传图片
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 个人简介 */}
                        <div class="card bg-base-100 shadow-lg">
                            <div class="card-body">
                                <h2 class="card-title text-xl mb-4">{t("profileSetting.userDesc")}</h2>
                                <textarea
                                    value={profileInput.description}
                                    onInput={(e) => { setProfileInput("description", e.target.value) }}
                                    class="textarea textarea-bordered h-24"
                                    placeholder="介绍一下你自己..."
                                    maxLength={50}
                                />
                                <div class="text-right text-sm text-gray-500">
                                    {profileInput.description.length}/50
                                </div>
                            </div>
                        </div>

                        {/* 保存按钮 */}
                        <div class="flex justify-end gap-4">
                            <button
                                type="button"
                                class="btn btn-primary"
                                disabled={!check()}
                                onClick={handleClick}
                            >
                                保存更改
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    )
}

export default ProfileSettings