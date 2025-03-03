import { OutputData } from "@editorjs/editorjs";
import { createAsync, useNavigate } from "@solidjs/router";
import { HSStepper } from "flyonui/flyonui";
import { Component, createEffect, createMemo, createSignal, For, onMount, Suspense } from "solid-js";
import { createStore } from "solid-js/store";

import { getCategoryAPI } from "../api/categories";
import { getGamesAPI } from "../api/game";
import { createModAPI } from "../api/mod";
import { Editor } from "../components/Editor";
import { FileUpload } from "../components/FileUpload";
import { ImageUpload } from "../components/ImageUpload";
import { useI18nContext } from "../context/I18nContext";
import { useNotifyContext } from "../context/NotifyContext";
import { CategoriesQuery } from "../types/categories";
import { GameQuery } from "../types/game";
import { CreateModRequest } from "../types/mod";

const CreateMod: Component = () => {
    const { t } = useI18nContext()
    const notify = useNotifyContext()
    const navigate = useNavigate()
    const [gameQuery, _setGameQuery] = createStore<GameQuery>({
        name: "",
        page: 0,
        page_size: 0,
        sort: "name",
        order: "desc",
    })
    const cateQuery: CategoriesQuery = {
        status: "enable"
    }

    const gameList = createAsync(() => getGamesAPI(gameQuery))
    const categories = createAsync(() => getCategoryAPI(cateQuery))

    const [editorData, setEditorData] = createSignal<OutputData>()
    const [isError, setIsError] = createSignal(false)
    const [gameName, setGameName] = createSignal('')
    const isExist = createMemo(() => editorData()?.blocks.length != 0)
    const [modInput, setModInput] = createStore<CreateModRequest>({
        name: '',
        description: '',
        content: '',
        category: '',
        game_id: -1,
        version: '',
        cover_id: -1,
        file_id: -1
    })
    let stepper: any

    //上传组件相应的Signal
    const [isSubmit, setIsSubmit] = createSignal(false)
    const [checkCover, setCheckCover] = createSignal(false)
    const [checkModFile, setCheckModFile] = createSignal(false)
    const [isCoverUpFinish, setIsCoverUpFinish] = createSignal(false)
    const [isModUpFinish, setIsModUpFinish] = createSignal(false)
    const [coverID, setCoverID] = createSignal(-1)
    const [fileID, setFileID] = createSignal(-1)

    createEffect(async () => {
        setModInput('content', JSON.stringify(editorData()))

        if (isCoverUpFinish() && isModUpFinish()) {
            setModInput('cover_id', coverID())
            setModInput('file_id', fileID())
            try {
                await createModAPI(modInput)
                //@ts-ignore
                stepper.handleFinishButtonClick()
            } catch (e) {
                setIsSubmit(false)
                setIsCoverUpFinish(false)
                setIsModUpFinish(false)
                notify.error(e)
            }
        }
    })

    onMount(() => {
        HSStepper.autoInit()
        stepper = HSStepper.getInstance('#wizard-validation-horizontal') as HSStepper
        stepper.on('beforeNext', (ind: number) => {
            if (ind === 1) {
                stepper.setProcessedNavItem(ind)

                setTimeout(() => {
                    stepper.unsetProcessedNavItem(ind)
                    stepper.enableButtons()

                    if (modInput.name === '' || modInput.category === '' || modInput.version === '' || modInput.game_id === -1) {
                        stepper.setErrorNavItem(ind)
                        setIsError(true)
                    } else {
                        stepper.goToNext()
                        setIsError(false)
                    }
                }, 300)
            }

            if (ind === 2) {
                stepper.setProcessedNavItem(ind)

                setTimeout(() => {
                    stepper.unsetProcessedNavItem(ind)
                    stepper.enableButtons()

                    if (modInput.description === '' || editorData()?.blocks.length === 0) {
                        stepper.setErrorNavItem(ind)
                        setIsError(true)
                    } else {
                        stepper.goToNext()
                        setIsError(false)
                    }
                }, 300)
            }
        })

        stepper.on('beforeFinish', () => {
            stepper.setProcessedNavItem(3)

            setTimeout(() => {
                stepper.unsetProcessedNavItem(3)
                stepper.enableButtons()
                if (!checkCover() || !checkModFile()) {
                    stepper.setErrorNavItem(3)
                    setIsSubmit(false)
                    setIsError(true)
                } else {
                    setIsSubmit(true)
                    setIsError(false)
                }
            }, 300)
        })

        stepper.on('finish', () => {
            setTimeout(() => {
                navigate("/mods")
            }, 2000)
        })

        return () => {
            stepper.destroy()
        }
    })

    //游戏ID映射
    const updateGameID = () => {
        const selectedGame = (gameList()?.data.list)?.find(game => game.name === gameName())
        if (selectedGame) {
            setModInput("game_id", selectedGame.id)
        }
    }

    //检测游戏是否存在
    const checkGame = (e: InputEvent & {
        currentTarget: HTMLInputElement;
        target: HTMLInputElement;
    }) => {
        setGameName(e.target.value)
        const gameExists = (gameList()?.data.list)?.find(game => game.name === gameName())
        if (!gameExists) {
            setModInput("game_id", -1)
        }
    }

    return (
        <div class="m-auto">
            <div data-stepper="" class="bg-base-100 w-full rounded-lg p-4 shadow" id="wizard-validation-horizontal">
                <ul class="relative flex flex-col gap-2 md:flex-row">
                    <li class="group flex flex-1 flex-col items-center gap-2 md:flex-row"
                        data-stepper-nav-item='{ "index": 1 }'>
                        <span
                            class="min-h-7.5 min-w-7.5 group inline-flex flex-col items-center gap-2 align-middle text-sm md:flex-row">
                            <span
                                class="stepper-active:bg-primary stepper-active:shadow stepper-active:text-primary-content stepper-success:bg-primary stepper-success:shadow stepper-success:text-primary-content stepper-error:bg-error stepper-error:text-error-content stepper-completed:bg-success stepper-completed:group-focus:bg-success bg-base-200/50 text-base-content group-focus:bg-base-content/20 size-7.5 flex flex-shrink-0 items-center justify-center rounded-full font-medium">
                                <span
                                    class="stepper-success:hidden stepper-error:hidden stepper-completed:hidden stepper-processed:hidden text-sm">1</span>
                                <span class="icon-[tabler--check] stepper-success:block hidden size-4 flex-shrink-0"></span>
                                <span class="icon-[tabler--x] stepper-error:block hidden size-4 flex-shrink-0"></span>
                                <span
                                    class="text-error stepper-processed:inline-block hidden size-4 animate-spin rounded-full border-[3px] border-current border-t-transparent"
                                    role="status" aria-label="loading">
                                    <span class="sr-only">Loading...</span>
                                </span>
                            </span>
                            <span class="text-base-content text-nowrap font-medium">{t('createMod.basic')}</span>
                        </span>
                        <div
                            class="stepper-success:bg-primary stepper-completed:bg-success bg-base-content/20 h-px w-full group-last:hidden max-md:mt-2 max-md:h-8 max-md:w-px md:flex-1">
                        </div>
                    </li>
                    <li class="group flex flex-1 flex-col items-center gap-2 md:flex-row"
                        data-stepper-nav-item='{ "index": 2 }'>
                        <span
                            class="min-h-7.5 min-w-7.5 group inline-flex flex-col items-center gap-2 align-middle text-sm md:flex-row">
                            <span
                                class="stepper-active:bg-primary stepper-active:shadow stepper-active:text-primary-content stepper-success:bg-primary stepper-success:shadow stepper-success:text-primary-content stepper-error:bg-error stepper-error:text-error-content stepper-completed:bg-success stepper-completed:group-focus:bg-success bg-base-200/50 text-base-content group-focus:bg-base-content/20 size-7.5 flex flex-shrink-0 items-center justify-center rounded-full font-medium">
                                <span
                                    class="stepper-success:hidden stepper-error:hidden stepper-completed:hidden stepper-processed:hidden text-sm">2</span>
                                <span class="icon-[tabler--check] stepper-success:block hidden size-4 flex-shrink-0"></span>
                                <span class="icon-[tabler--x] stepper-error:block hidden size-4 flex-shrink-0"></span>
                                <span
                                    class="text-error stepper-processed:inline-block hidden size-4 animate-spin rounded-full border-[3px] border-current border-t-transparent"
                                    role="status" aria-label="loading">
                                    <span class="sr-only">Loading...</span>
                                </span>
                            </span>
                            <span class="text-base-content text-nowrap font-medium">{t('createMod.info')}</span>
                        </span>
                        <div
                            class="stepper-success:bg-primary stepper-completed:bg-success bg-base-content/20 h-px w-full group-last:hidden max-md:mt-2 max-md:h-8 max-md:w-px md:flex-1">
                        </div>
                    </li>
                    <li class="group flex flex-1 flex-col items-center gap-2 md:flex-row"
                        data-stepper-nav-item='{ "index": 3 }'>
                        <span
                            class="min-h-7.5 min-w-7.5 group inline-flex flex-col items-center gap-2 align-middle text-sm md:flex-row">
                            <span
                                class="stepper-active:bg-primary stepper-active:shadow stepper-active:text-primary-content stepper-success:bg-primary stepper-success:shadow stepper-success:text-primary-content stepper-error:bg-error stepper-error:text-error-content stepper-completed:bg-success stepper-completed:group-focus:bg-success bg-base-200/50 text-base-content group-focus:bg-base-content/20 size-7.5 flex flex-shrink-0 items-center justify-center rounded-full font-medium">
                                <span
                                    class="stepper-success:hidden stepper-error:hidden stepper-completed:hidden text-sm">3</span>
                                <span class="icon-[tabler--check] stepper-success:block hidden size-4 flex-shrink-0"></span>
                                <span class="icon-[tabler--x] stepper-error:block hidden size-4 flex-shrink-0"></span>
                            </span>
                            <span class="text-base-content text-nowrap font-medium">{t('createMod.upload')}</span>
                        </span>
                        <div
                            class="stepper-success:bg-primary stepper-completed:bg-success bg-base-content/20 h-px w-full group-last:hidden max-md:mt-2 max-md:h-8 max-md:w-px md:flex-1">
                        </div>
                    </li>
                </ul>
                <form id="wizard-validation-form-horizontal" class="needs-validation mt-5 sm:mt-8">
                    <div id="account-details-validation" class="space-y-5" data-stepper-content-item='{ "index": 1 }'>
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label class="label label-text" for="ModNameHorizontal"> {t('createMod.modName')}</label>
                                <input type="text" placeholder={t('createMod.modNamePlaceholder')} class="input"
                                    classList={{ "is-invalid": modInput.name === "" && isError() }} id="firstNameHorizontal"
                                    onInput={(e) => setModInput("name", e.target.value)} maxlength="20" />
                            </div>
                            <div>
                                <label class="label label-text" for="passwordHorizontal">{t('createMod.modVersion')
                                }</label>
                                <input type="text" placeholder={t('createMod.modVersionPlaceholder')}
                                    class="input max-w-sm" classList={{ 'is-invalid': modInput.version === '' && isError() }}
                                    onInput={(e) => setModInput("version", e.target.value)} maxlength="10" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div class="flex flex-col">
                                <label for="exampleDataList" class="label label-text">{t('createMod.modGame')}</label>
                                <input class="input max-w-sm " list="datalistOptions" id="exampleDataList"
                                    placeholder={t('createMod.modGamePlaceholder')}
                                    onChange={updateGameID} onInput={checkGame}
                                    classList={{ 'is-invalid': modInput.game_id === -1 && isError() }} />
                                <Suspense>
                                    <datalist id="datalistOptions">
                                        <For each={gameList()?.data.list}>
                                            {(game) =>
                                                <option id={game.id.toString()} value={game.name} />
                                            }
                                        </For>
                                    </datalist>
                                </Suspense>
                            </div>
                            <div>
                                <label class="label label-text" for="TypeHorizontal">{t('createMod.modType')}</label>
                                <select class="select max-w-sm appearance-none" aria-label="select"
                                    onInput={(e) => setModInput("category", e.target.value)}
                                    classList={{ 'is-invalid': modInput.category === '' && isError() }}>
                                    <option disabled selected>{t('createMod.modTypePlaceholder')}</option>
                                    <Suspense>
                                        <For each={categories()?.data.list}>
                                            {(category, index) =>
                                                <option id={index.toString()} value={category.name} >{category.name}</option>
                                            }
                                        </For>
                                    </Suspense>
                                </select>
                            </div>
                        </div>
                    </div >
                    <div id="personal-info-validation" class="space-y-5" data-stepper-content-item='{ "index": 2 }'
                        style="display: none">
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-1">
                            <div>
                                <div class="label label-text">{t('createMod.modDesc')} </div>
                                <textarea class="textarea w-[507px]" placeholder={t('createMod.modDescPlaceholder')}
                                    maxlength="50" onInput={(e) => setModInput("description", e.target.value)}
                                    classList={{ 'is-invalid': modInput.description === '' && isError() }}></textarea>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-1">
                            <div>
                                <label class="label label-text"> {t('createMod.modInfo')}</label>
                                <div class="flex justify-center" classList={{ 'is-invalid': !isExist() && isError() }}>
                                    <Editor setEditorData={setEditorData} />
                                </div>
                            </div>
                        </div >
                    </div >
                    <div id="social-links-validation" class="space-y-5" data-stepper-content-item='{ "index": 3}'
                        style="display: none">
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-1">
                            <div>
                                <label class="label label-text">{t('createMod.coverUpload')}</label>
                                <div class="flex justify-center" classList={{ 'is-invalid': !checkCover() && isError() }}>
                                    <ImageUpload setCheck={setCheckCover} isSubmit={isSubmit} setFinish={setIsCoverUpFinish}
                                        setCoverID={setCoverID} />
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-1">
                            <div>
                                <label class="label label-text">
                                    {t('createMod.modUpload')}
                                </label>
                                <div class="flex justify-center" classList={{ 'is-invalid': !checkModFile() && isError() }}>
                                    <FileUpload setCheck={setCheckModFile} isSubmit={isSubmit} setFinish={setIsModUpFinish} check={checkModFile} setFileID={setFileID} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div data-stepper-content-item='{ "isFinal": true }' style="display: none">
                        <div
                            class="border-base-content/40 bg-base-200/50 flex h-48 items-center justify-center rounded-xl border border-dashed p-4">
                            <h3 class="text-base-content/50 text-3xl">{t('createMod.modFinished')}</h3>
                        </div>
                    </div>
                    <div class="mt-5 flex items-center justify-between gap-y-2">
                        <button type="button" class="btn btn-primary btn-prev max-sm:btn-square" data-stepper-back-btn="">
                            <span class="icon-[tabler--chevron-left] text-primary-content size-5 rtl:rotate-180"></span>
                            <span class="max-sm:hidden">{t('back')}</span>
                        </button>
                        <button type="button" class="btn btn-primary btn-next max-sm:btn-square" data-stepper-next-btn="">
                            <span class="max-sm:hidden">{t('next')}</span>
                            <span class="icon-[tabler--chevron-right] text-primary-content size-5 rtl:rotate-180"></span>
                        </button>
                        <button type="button" class="btn btn-primary" data-stepper-finish-btn="" style="display: none">
                            {t('finish')}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    )
}

export default CreateMod