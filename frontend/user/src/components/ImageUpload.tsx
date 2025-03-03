import HSFileUpload, { ICollectionItem } from "flyonui/dist/js/file-upload"
import { Accessor, Component, createEffect, onMount, Setter } from "solid-js"
import { apiUrl } from "../api"
import { useI18nContext } from "../context/I18nContext"
import { useNotifyContext } from "../context/NotifyContext"
import { getToken } from "../utils/token"

type ImageUploadProps = {
    setCheck: Setter<boolean>
    setFinish: Setter<boolean>
    isSubmit: Accessor<boolean>
    setCoverID: Setter<number>
}

export const ImageUpload: Component<ImageUploadProps> = (props) => {
    const { t } = useI18nContext()
    const notify = useNotifyContext()
    let dropzone: any

    onMount(() => {
        HSFileUpload.autoInit()
        const { element } = HSFileUpload.getInstance('#file-upload', true) as ICollectionItem<HSFileUpload>
        dropzone = element.dropzone

        dropzone.on("error", (file: any, _response: any) => {
            props.setCheck(false)
            //@ts-ignore
            if (file.size > element.concatOptions.maxFilesize * 1024 * 1024) {
                notify.error(t("fileUpload.coverSize"))
            }
        })

        dropzone.on("addedfile", () => {
            props.setCheck(true)
        })

        dropzone.on("success", (_file: any, response: any) => {
            props.setCoverID(response.data.file_id)
            props.setFinish(true)
        })

        dropzone.on("removedfile", () => {
            props.setCheck(false)
        })

        return () => {
            element.destroy()
        }
    })

    createEffect(() => {
        if (props.isSubmit()) {
            dropzone.processQueue()
        }
    })

    return (
        <div
            id="file-upload"
            data-file-upload={JSON.stringify({
                url: `${apiUrl}/upload/file?type=mod_cover`,
                autoProcessQueue: false,
                resizeWidth: 512,
                resizeHeight: 512,
                resizeQuality: 1,
                thumbnailWidth: 144,
                thumbnailHeight: 144,
                acceptedFiles: "image/*",
                maxFiles: 1,
                singleton: true,
                maxFilesize: 5,
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })} >
            <template data-file-upload-preview="">
                <div class="size-36">
                    <img class="w-full object-contain" data-dz-thumbnail="" />
                </div>
            </template>

            <div class="flex flex-wrap items-center gap-3 sm:gap-5">
                <div class="group" data-file-upload-previews="" data-file-upload-pseudo-trigger="">
                    <span class="border-base-content/30 text-base-content/50 flex size-36 shrink-0 cursor-pointer items-center justify-center border-2 border-dotted hover:bg-base-200/60 group-has-[div]:hidden" >
                        <span class="icon-[tabler--user-circle] size-9 shrink-0"></span>
                    </span>
                </div>
                <div class="grow">
                    <div class="flex items-center gap-x-2">
                        <button type="button" class="btn btn-primary" data-file-upload-trigger="">
                            <span class="icon-[tabler--upload] size-4 shrink-0"></span>
                            {t("fileUpload.imageUpload")}
                        </button>
                        <button type="button" class="btn btn-outline btn-secondary" data-file-upload-clear="">
                            {t("deleteItem")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}