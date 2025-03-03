import { A, createAsync, Navigator, useNavigate, useParams } from "@solidjs/router"
import { HSOverlay } from "flyonui/flyonui"
import { Accessor, Component, createMemo, createSignal, For, onMount, Show, Suspense } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"
import { createCommentAPI, deleteCommentAPI, getCommentsAPI } from "../api/comment"
import { CreateReport } from "../api/report"
import { useNotifyContext } from "../context/NotifyContext"
import { useAuthStore } from "../stores/auth"
import { Comment, CommentRequest } from "../types/comment"
import { CreateReportRequest } from "../types/report"

const CommentPage: Component = () => {
  const params = useParams()
  const [refresh, setRefresh] = createSignal(false)
  const navigate: Navigator = useNavigate()
  const notify = useNotifyContext()
  // 数据状态管理
  const comments = createAsync(() => getCommentsAPI(params.id, refresh()))
  const [order, setOrder] = createSignal(true)
  let modal: HSOverlay

  const [commentInput, setCommentInput] = createStore<CommentRequest>({
    content: "",
    mod_id: parseInt(params.id),
    parent_id: 0
  })
  const [report, setReport] = createStore<CreateReportRequest>({
    type: "",
    target: 0,
    reason: "侮辱",
  })

  // 排序逻辑
  const sortedComments = createMemo(() => {
    const items = comments()?.data.list || []
    if (order() === true) {
      return [...items].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else {
      return [...items].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }
  })

  // 提交新评论
  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    if (!commentInput.content.trim()) return

    try {
      await createCommentAPI(commentInput)
      setCommentInput("content", "")
      setRefresh(!refresh())
      setTimeout(() => {
        window.HSStaticMethods.autoInit()
      }, 300)
    } catch (err) {
      console.error("提交评论失败:", err)
    }
  }

  const handleCommentSubmit = async (e: Event) => {
    e.preventDefault()

    try {
      await CreateReport(report)
      modal.close()
      notify.success("提交成功")
    } catch {
      modal.close()
      notify.error("提交失败")
    }
  }

  onMount(() => {
    modal = new HSOverlay(document.querySelector('#focus-modal-2')!)
    return () => {
      modal.destroy()
    }
  })

  return (
    <div class="max-w-4xl p-4 bg-base-100 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">
          评论 ({comments()?.data.total ? comments()?.data.total : 0})
        </h1>
        <div>
          <span class="icon-[tabler--arrows-sort] size-6 cursor-pointer" onClick={() => setOrder(!order())}></span>
        </div>
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} class="mb-8">
        <div class="flex gap-4">
          <div class="flex-1">
            <textarea
              value={commentInput.content}
              onInput={(e) => setCommentInput("content", e.currentTarget.value)}
              class="textarea textarea-bordered w-full h-24"
              placeholder="写下你的评论..."
              disabled={!comments()}
              maxLength="100"
            />
            <div class="mt-2 flex justify-end">
              <button
                type="submit"
                class="btn btn-primary"
                disabled={!comments()}
              >
                {'提交评论'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 评论列表 */}
      <Suspense fallback={<span class="loading loading-dots loading-lg"></span>}>
        <div class="space-y-6">
          <For each={sortedComments()}>
            {(comment, index) => <CommentItem comment={comment} index={index} setReport={setReport} onReply={() => setRefresh(!refresh())} modal={modal} navigate={navigate} />}
          </For>
        </div>
      </Suspense>

      <div id="focus-modal-2" class="overlay modal overlay-open:opacity-100 hidden [--has-autofocus:false]" role="dialog" tabindex="-1" >
        <div class="modal-dialog overlay-open:opacity-100">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">举报</h3>
              <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" data-overlay="#focus-modal" >
                <span class="icon-[tabler--x] size-4"></span>
              </button>
            </div>
            <form onSubmit={handleCommentSubmit}>
              <div class="modal-body pt-0">
                <div class="mb-4">
                  <label class="label label-text" for="type">类型</label>
                  <input type="text" class="input" id="type" value={report.type === "mod" ? "模组" : "评论"} disabled />
                </div>
                <div class="mb-0.5">
                  <label class="label label-text" for="reason">原因</label>
                  <select class="select" id="reason" onInput={(e) => setReport("reason", e.target.value)}>
                    <option>侮辱</option>
                    <option>广告</option>
                    <option>暴力</option>
                    <option>引战</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-soft btn-secondary" onClick={() => modal.close()}>关闭</button>
                <button type="submit" class="btn btn-primary">提交</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const CommentItem: Component<{
  comment: Comment
  index: Accessor<number>
  onReply: () => void
  setReport: SetStoreFunction<CreateReportRequest>
  modal: HSOverlay
  navigate: Navigator
}> = (props) => {
  const [isReplying, setIsReplying] = createSignal(false)
  const params = useParams()

  const [commentInput, setCommentInput] = createStore<CommentRequest>({
    content: "",
    mod_id: parseInt(params.id),
    parent_id: props.comment.id
  })

  // 提交回复
  const handleReply = async (e: Event) => {
    e.preventDefault()
    if (!commentInput.content.trim().trim()) return

    try {
      await createCommentAPI(commentInput)
      setCommentInput("content", "")
      setIsReplying(false)
      props.onReply() // 刷新评论列表
      setTimeout(() => {
        window.HSStaticMethods.autoInit()
      }, 300)
    } catch (err) {
      console.error("提交回复失败:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCommentAPI(id)
      props.onReply() // 刷新评论列表
      setTimeout(() => {
        window.HSStaticMethods.autoInit()
      }, 300)
    } catch (err) {
      console.error("删除评论失败:", err)
    }
  }

  const authStore = useAuthStore()

  return (
    <div class="card bg-base-200 shadow-sm">
      <div class="card-body">
        <div class="flex gap-4">
          <A href={`/user/${props.comment.user.user_name}`} target="_blank">
            <img
              src={props.comment.user.user_profile.avatar_file.url}
              alt="avatar"
              class="rounded-full w-10 h-10"
            />
          </A>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <A href={`/user/${props.comment.user.user_name}`} target="_blank">
                <span class="font-bold">{props.comment.user.user_name}</span>
              </A>
              <span class="text-sm text-gray-500">
                {new Date(props.comment.created_at).toLocaleString()}
              </span>
              <div class="dropdown relative inline-flex rtl:[--placement:bottom-end] ml-auto">
                <button id="dropdown-menu-icon" type="button" class="dropdown-toggle btn btn-square btn-soft btn-sm" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                  <span class="icon-[tabler--dots-vertical] size-6"></span>
                </button>
                <ul class="dropdown-menu dropdown-open:opacity-100 hidden min-w-32" role="menu" aria-orientation="vertical" aria-labelledby="dropdown-menu-icon">
                  <li><button class="dropdown-item text-info --prevent-on-load-init" aria-haspopup="dialog" aria-expanded="false" aria-controls="focus-modal-2" onClick={() => {
                    if (!useAuthStore().isLogin()) {
                      props.navigate("/login")
                    } else {
                      props.modal.open()
                      props.setReport("type", "comment")
                      props.setReport("target", props.comment.id)
                    }
                  }
                  }>举报</button></li>
                  <Show when={authStore.profile()?.id === props.comment.user.id}>
                    <li><button class="dropdown-item text-error" onClick={() => handleDelete(props.comment.id.toString())}>删除</button></li>
                  </Show>
                </ul>
              </div>
            </div>

            <p class="whitespace-pre-wrap break-words max-w-full">{props.comment.content}</p>

            <div class="flex gap-4 mt-2">
              <button
                class="btn btn-ghost btn-sm"
                onClick={() => setIsReplying(!isReplying())}
              >
                回复
              </button>
            </div>

            {/* 回复表单 */}
            {isReplying() && (
              <div class="mt-4 pl-8">
                <form onSubmit={handleReply} class="flex gap-2">
                  <input
                    type="text"
                    value={commentInput.content}
                    onInput={(e) => setCommentInput("content", e.currentTarget.value)}
                    class="input input-bordered flex-1"
                    placeholder="写下你的回复..."
                    maxLength="100"
                  />
                  <button type="submit" class="btn btn-primary btn-sm m-auto">发送</button>
                </form>
              </div>
            )}

            {/* 子评论 */}
            {props.comment.replies && (
              <div class="mt-4 pl-8 space-y-4">
                <For each={props.comment.replies}>
                  {(reply) => (
                    <div class="flex gap-4">
                      <A href={`/user/${props.comment.user.user_name}`} target="_blank">
                        <img
                          src={reply.user.user_profile.avatar_file.url}
                          alt="avatar"
                          class="rounded-full w-8 h-8"
                        />
                      </A>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <A href={`/user/${props.comment.user.user_name}`} target="_blank">
                            <span class="font-bold text-sm">{reply.user.user_name}</span>
                          </A>
                          <span class="text-xs text-gray-500">
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p class="text-sm whitespace-pre-wrap break-words max-w-full">{reply.content}</p>
                      </div>
                      <div class="dropdown relative inline-flex rtl:[--placement:bottom-end] ml-auto">
                        <button id="dropdown-menu-icon" type="button" class="dropdown-toggle btn btn-square btn-soft btn-xs" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                          <span class="icon-[tabler--dots-vertical] size-6"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-open:opacity-100 hidden min-w-32" role="menu" aria-orientation="vertical" aria-labelledby="dropdown-menu-icon">
                          <li><button class="dropdown-item text-info --prevent-on-load-init" aria-haspopup="dialog" aria-expanded="false" aria-controls="focus-modal-2" data-overlay="#focus-modal-2" onClick={() => {
                            if (!useAuthStore().isLogin()) {
                              props.navigate("/login")
                            } else {
                              props.modal.open()
                              props.setReport("type", "comment")
                              props.setReport("target", reply.id)
                            }
                          }
                          }>举报</button></li>
                          <Show when={authStore.profile()?.id === props.comment.user.id}>
                            <li><button class="dropdown-item text-error" onClick={() => handleDelete(reply.id.toString())}>删除</button></li>
                          </Show>
                        </ul>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentPage