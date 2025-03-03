import '@deltablot/dropzone/dist/dropzone-min'
import HSFileUpload from "flyonui/dist/js/file-upload"
import { HSStaticMethods, ICollectionItem } from 'flyonui/flyonui'
import { Accessor, Component, createEffect, onMount, Setter } from 'solid-js'
import { apiUrl } from '../api'
import { useI18nContext } from '../context/I18nContext'
import { getToken } from '../utils/token'

type FileUploadProps = {
    check: Accessor<boolean>
    setCheck: Setter<boolean>
    setFinish: Setter<boolean>
    isSubmit: Accessor<boolean>
    setFileID: Setter<number>
}

export const FileUpload: Component<FileUploadProps> = (props) => {
    const { t } = useI18nContext()
    let dropzone: any

    onMount(() => {
        HSFileUpload.autoInit()
        const { element } = HSFileUpload.getInstance('#file-upload-limit', true) as ICollectionItem<HSFileUpload>
        dropzone = element.dropzone

        dropzone.on('error', (file: any, _response: any) => {
            props.setCheck(false)
            //@ts-ignore
            if (file.size > element.concatOptions.maxFilesize * 1024 * 1024) {
                const filePreview = file.previewElement
                const successEls = filePreview.querySelectorAll('[data-file-upload-file-success]')
                const errorEls = filePreview.querySelectorAll('[data-file-upload-file-error]')
                if (successEls) successEls.forEach((el: { style: { display: string } }) => (el.style.display = 'none'))
                errorEls.forEach((el: { style: { display: string } }) => (el.style.display = ''))
                HSStaticMethods.autoInit(['tooltip'])
            }
        })

        dropzone.on("addedfile", () => {
            props.setCheck(true)
        })

        dropzone.on("success", (_file: any, response: any) => {
            props.setFileID(response.data.file_id)
            props.setFinish(true)
        })

        dropzone.on("removedfile", () => {
            props.setCheck(false)
        })

        return () => {
            element.destroy()
        }
    })

    createEffect(async () => {
        if (props.isSubmit()) {
            dropzone.processQueue()
        }
    })

    return (
        <div
            id="file-upload-limit"
            data-file-upload={JSON.stringify({
                url: `${apiUrl}/upload/file?type=mod_file`,
                autoProcessQueue: false,
                maxFiles: 1,
                singleton: true,
                maxFilesize: 100,
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
            })} >
            <template data-file-upload-preview="" >
                <div class="rounded-box bg-base-100 p-4 shadow-lg">
                    <div class="mb-1 flex items-center justify-between">
                        <div class="flex items-center gap-x-3">
                            <span class="text-base-content/80 border-base-content/20 flex size-8 items-center justify-center rounded-lg border p-0.5" data-file-upload-file-icon="" >
                                <img class="hidden rounded-md" data-dz-thumbnail="" />
                            </span>
                            <div>
                                <p class="text-base-content text-sm font-medium">
                                    <span class="inline-block truncate align-bottom" data-file-upload-file-name=""></span>
                                    .
                                    <span data-file-upload-file-ext=""></span>
                                </p>
                                <p class="text-base-content/50 text-xs" data-file-upload-file-size="" data-file-upload-file-success=""></p>
                                <p class="text-error text-xs" style="display: none" data-file-upload-file-error="">
                                    File exceeds size limit.
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="tooltip [--placement:top]" style="display: none" data-file-upload-file-error="">
                                <button type="button" class="tooltip-toggle btn btn-sm btn-circle btn-text btn-error">
                                    <span class="icon-[tabler--alert-circle] size-4 shrink-0"></span>
                                </button>
                                <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                                    <span class="tooltip-body">Please try to upload a file smaller than 200MB.</span>
                                </span>
                            </div>
                            <button type="button" class="btn btn-sm btn-circle btn-text" data-file-upload-reload="">
                                <span class="icon-[tabler--refresh] size-4 shrink-0"></span>
                            </button>
                            <button type="button" class="btn btn-sm btn-circle btn-text" data-file-upload-remove="">
                                <span class="icon-[tabler--trash] size-4 shrink-0"></span>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center gap-x-3 whitespace-nowrap">
                        <div class="progress h-2" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" data-file-upload-progress-bar="" >
                            <div class="progress-bar progress-primary file-upload-complete:progress-success transition-all duration-500" style="width: 0" data-file-upload-progress-bar-pane="" ></div>
                        </div>
                        <span class="text-base-content mb-0.5 text-sm">
                            <span data-file-upload-progress-bar-value="">0</span>
                        </span>
                    </div>
                </div>
            </template>

            <div class="border-base-content/20 bg-base-100 rounded-box flex cursor-pointer justify-center border border-dashed p-6 w-[420px]" data-file-upload-trigger="" >
                <div class="text-center">
                    <span class="bg-base-200/80 text-base-content inline-flex size-16 items-center justify-center rounded-full">
                        <span class="icon-[tabler--upload] size-6 shrink-0"></span>
                    </span>
                    <div class="mt-4 flex flex-wrap justify-center">
                        <span class="text-base-content pe-1 text-base font-medium">{t('fileUpload.dropFile')}</span>
                    </div>
                    <p class="text-base-content/50 mt-1 text-xs">{t('fileUpload.fileSizeLimit')}</p>
                </div>
            </div>
            <div class="mt-4 space-y-2 empty:mt-0" data-file-upload-previews=""></div>
        </div >
    )
}