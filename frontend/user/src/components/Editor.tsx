//@ts-ignore
import EditorJS, { BlockToolConstructable, OutputData } from "@editorjs/editorjs"
import Header from "@editorjs/header"
import ImageTool from "@editorjs/image"
import InlineCode from "@editorjs/inline-code"
import NestedList from "@editorjs/nested-list"
import { onMount, ParentComponent, Setter } from "solid-js"
import axiosInstance from "../api"
import { useI18nContext } from "../context/I18nContext"
//@ts-ignore
import DragDrop from "editorjs-drag-drop"
//@ts-ignore
import Undo from 'editorjs-undo'
import { HSOverlay } from "flyonui/flyonui"

type EditorProps = {
    EditorData?: any,
    setEditorData: Setter<OutputData | undefined>,
    class?: string
    handleClick?: () => void
}

export const Editor: ParentComponent<EditorProps> = (props) => {
    const { t } = useI18nContext()
    let modal: HSOverlay

    onMount(() => {
        modal = new HSOverlay(document.getElementById('text-editor-modal')!)
        const editor = new EditorJS({
            holder: "description",
            placeholder: t('typeHere'),

            tools: {
                header: {
                    class: Header as unknown as BlockToolConstructable,
                    inlineToolbar: true,
                    config: {
                        placeholder: 'Header',
                    },
                },
                list: {
                    class: NestedList as unknown as BlockToolConstructable,
                    inlineToolbar: true,
                },
                image: {
                    class: ImageTool as unknown as BlockToolConstructable,
                    config: {
                        uploader: {
                            uploadByFile(file: any) {
                                const formData = new FormData()
                                formData.append('file', file)
                                return axiosInstance.post('/upload/post_image', formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data'
                                    }
                                }).then((res) => {
                                    return {
                                        success: 1,
                                        file: {
                                            url: res.data
                                        }
                                    }
                                }).catch(() => {
                                    return {
                                        success: 0
                                    }
                                })
                            }
                        },
                        features: {
                            border: false,
                            caption: false
                        }
                    }
                },
                inlineCode: {
                    class: InlineCode
                },
            },
            onReady: () => {
                new DragDrop(editor, "2px solid #fff")
                new Undo({ editor })
                editor
                    .save()
                    .then((outputData: OutputData) => {
                        props.setEditorData(outputData)
                    })
            },
            onChange: () => {
                editor
                    .save()
                    .then((outputData: OutputData) => {
                        props.setEditorData(outputData)
                    })
                    .catch((e) => {
                        console.log('Saving failed: ', e)
                    })
            },
        })

        editor.isReady
            .then(() => {
                if (props.EditorData) {
                    editor.render(props.EditorData)
                }
            }).catch((error) => {
                console.error('Editor.js initialization failed: ', error);
            })

        return () => {
            editor.destroy()
            modal.destroy()
        }
    })

    return (
        <>
            <button type="button" class={props.class ? props.class : "btn btn-primary"} aria-haspopup="dialog" aria-expanded="false"
                aria-controls="text-editor-modal" data-overlay="#text-editor-modal" onClick={props.handleClick ? props.handleClick : undefined} >{t('createMod.clickToEdit')}</button>
            <div id="text-editor-modal" class="overlay modal overlay-open:opacity-100 hidden [--overlay-backdrop:static]" role="dialog" tabindex="-1">
                <div class="modal-dialog overlay-open:opacity-100 modal-dialog-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title">{t('createMod.modInfo')}</h3>
                            <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close"
                                data-overlay="#text-editor-modal">
                                <span class="icon-[tabler--x] size-4"></span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="description" class="border border-base-content/25 rounded-box p-4 break-words">
                            </div>
                        </div>
                        {props.children}
                    </div>
                </div>
            </div>
        </>
    )
}