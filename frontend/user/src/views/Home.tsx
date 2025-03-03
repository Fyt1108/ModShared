import { Component, For, createSignal } from "solid-js";

const Home: Component = () => {
    const [searchQuery, setSearchQuery] = createSignal("");

    // 模拟数据
    const categories = [
        { name: "模组", icon: "📦", count: 2541 },
        { name: "插件", icon: "🔌", count: 892 },
        { name: "数据包", icon: "💾", count: 567 },
        { name: "整合包", icon: "🎁", count: 1342 },
    ];

    const featuredProjects = [
        {
            title: "Fabulous Optimizer",
            description: "下一代性能优化模组，提升帧率高达300%",
            downloads: "1.2M",
            icon: "🚀",
            category: "优化"
        },
        // 更多项目...
    ];

    return (
        <div class="min-h-screen bg-base-100">
            {/* 搜索区 */}
            <div class="hero bg-base-200 py-16 px-4">
                <div class="hero-content text-center max-w-4xl">
                    <div class="w-full">
                        <h1 class="text-4xl md:text-5xl font-bold mb-8">
                            探索 Minecraft 的无限可能
                        </h1>
                        <div class="join w-full max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder="搜索模组、整合包..."
                                class="input input-bordered join-item w-full"
                                value={searchQuery()}
                                onInput={(e) => setSearchQuery(e.target.value)}
                            />
                            <button class="btn btn-primary join-item">
                                搜索
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 分类浏览 */}
            <div class="container mx-auto px-4 py-16">
                <h2 class="text-3xl font-bold mb-8 text-center">热门分类</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <For each={categories}>
                        {(category) => (
                            <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                                <div class="card-body items-center text-center p-4">
                                    <div class="text-4xl mb-2">{category.icon}</div>
                                    <h3 class="card-title text-lg">{category.name}</h3>
                                    <div class="badge badge-primary badge-sm mt-2">
                                        {category.count}+ 项目
                                    </div>
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </div>

            {/* 精选项目 */}
            <div class="bg-base-200 py-16">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-3xl font-bold">精选项目</h2>
                        <a class="btn btn-ghost">查看全部 →</a>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <For each={featuredProjects}>
                            {(project) => (
                                <div class="card bg-base-100 shadow-lg hover:translate-y-[-4px] transition-all">
                                    <div class="card-body">
                                        <div class="flex items-start gap-4">
                                            <div class="text-4xl">{project.icon}</div>
                                            <div>
                                                <h3 class="card-title">{project.title}</h3>
                                                <div class="badge badge-outline">
                                                    {project.category}
                                                </div>
                                            </div>
                                        </div>
                                        <p class="mt-4 line-clamp-3">{project.description}</p>
                                        <div class="card-actions justify-between items-center mt-6">
                                            <div class="flex items-center gap-2">
                                                <span class="i-heroicons-arrow-down-tray-20-solid" />
                                                <span>{project.downloads}</span>
                                            </div>
                                            <button class="btn btn-primary btn-sm">
                                                查看详情
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </div>

            {/* 统计信息 */}
            <div class="container mx-auto px-4 py-16">
                <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
                    <div class="stat">
                        <div class="stat-title">总项目数</div>
                        <div class="stat-value">12K+</div>
                        <div class="stat-desc">2023年新增 2.3K</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">总下载量</div>
                        <div class="stat-value">2.1B</div>
                        <div class="stat-desc">最近30天 120M</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">活跃开发者</div>
                        <div class="stat-value">3.8K</div>
                        <div class="stat-desc">来自 89 个国家</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home