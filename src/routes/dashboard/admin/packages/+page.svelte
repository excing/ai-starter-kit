<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Badge } from "$lib/components/ui/badge";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import { Package, Plus, Pencil, Loader2, Eye, EyeOff } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { PAGINATION } from "$lib/config/constants";
    import Pagination from "$lib/components/common/Pagination.svelte";
    import type { CreditPackage } from "$lib/types/credits";

    let packages = $state<CreditPackage[]>([]);
    let loading = $state(true);
    let total = $state(0);
    let page = $state(1);
    const limit = PAGINATION.DEFAULT_LIMIT;

    // Dialog state
    let dialogOpen = $state(false);
    let editing = $state<CreditPackage | null>(null);
    let formName = $state("");
    let formCredits = $state("");
    let formPrice = $state("");
    let formDescription = $state("");
    let submitting = $state(false);

    async function loadPackages() {
        loading = true;
        try {
            const offset = (page - 1) * limit;
            const res = await fetch(`/api/admin/packages?limit=${limit}&offset=${offset}`);
            if (res.ok) {
                const data = await res.json();
                packages = data.packages;
                total = data.total;
            }
        } catch {
            toast.error("加载套餐列表失败");
        } finally {
            loading = false;
        }
    }

    function openCreateDialog() {
        editing = null;
        formName = "";
        formCredits = "";
        formPrice = "";
        formDescription = "";
        dialogOpen = true;
    }

    function openEditDialog(pkg: CreditPackage) {
        editing = pkg;
        formName = pkg.name;
        formCredits = String(pkg.credits);
        formPrice = String(pkg.price);
        formDescription = pkg.description ?? "";
        dialogOpen = true;
    }

    async function handleSubmit() {
        if (!formName.trim()) {
            toast.error("套餐名称不能为空");
            return;
        }
        const credits = parseInt(formCredits, 10);
        if (!credits || credits <= 0) {
            toast.error("积分数量必须为正整数");
            return;
        }
        const price = parseInt(formPrice, 10);
        if (isNaN(price) || price < 0) {
            toast.error("价格必须为非负整数（单位：分）");
            return;
        }
        submitting = true;

        const payload = {
            name: formName.trim(),
            credits,
            price,
            description: formDescription.trim() || null,
        };

        try {
            if (editing) {
                const res = await fetch(`/api/admin/packages/${editing.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) {
                    toast.error(data.error || "更新失败");
                    return;
                }
                // 成功后用服务器数据更新本地列表
                packages = packages.map(p => p.id === editing!.id ? data.package : p);
                toast.success("套餐已更新");
            } else {
                const res = await fetch("/api/admin/packages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) {
                    toast.error(data.error || "创建失败");
                    return;
                }
                // 成功后跳转到第一页并重新加载
                if (page === 1) {
                    await loadPackages();
                } else {
                    page = 1;
                }
                toast.success("套餐已创建");
            }
            dialogOpen = false;
        } catch {
            toast.error("网络错误，请重试");
        } finally {
            submitting = false;
        }
    }

    async function toggleField(pkg: CreditPackage, field: "isActive" | "isVisible") {
        const newValue = field === "isActive" ? !pkg.isActive : !pkg.isVisible;
        try {
            const res = await fetch(`/api/admin/packages/${pkg.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: newValue }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "操作失败");
                return;
            }
            packages = packages.map(p => p.id === pkg.id ? data.package : p);
            if (field === "isActive") {
                toast.success(newValue ? "套餐已启用" : "套餐已停用");
            } else {
                toast.success(newValue ? "套餐已对用户可见" : "套餐已对用户隐藏");
            }
        } catch {
            toast.error("网络错误，请重试");
        }
    }

    function formatPrice(price: number): string {
        if (price === 0) return "免费";
        return `¥${(price / 100).toFixed(2)}`;
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    }

    $effect(() => {
        page;
        loadPackages();
    });
</script>

<div class="flex flex-col gap-6 p-4 sm:p-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
            <h1 class="text-2xl font-bold flex items-center gap-2 sm:text-3xl sm:gap-3">
                <Package class="h-6 w-6 shrink-0 sm:h-8 sm:w-8" />
                <span class="hidden sm:inline truncate">套餐管理</span>
            </h1>
            <p class="text-muted-foreground mt-1 text-sm sm:text-base truncate hidden sm:block">创建和管理积分套餐</p>
        </div>
        <div class="flex gap-2 shrink-0">
            <Button size="sm" class="sm:size-default" onclick={openCreateDialog}>
                <Plus class="mr-1.5 h-4 w-4 sm:mr-2" />
                创建套餐
            </Button>
        </div>
    </div>

    <!-- 主内容区 -->
    <Card.Root>
        <Card.Header>
            <Card.Title>套餐列表</Card.Title>
            <Card.Description>管理所有积分套餐配置</Card.Description>
        </Card.Header>
        <Card.Content>
            {#if loading}
                <div class="space-y-2">
                    <Skeleton class="h-16 w-full" />
                    <Skeleton class="h-16 w-full" />
                    <Skeleton class="h-16 w-full" />
                </div>
            {:else if packages.length === 0}
                <div class="text-center py-12">
                    <Package class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 class="text-lg font-medium mb-2">暂无套餐</h3>
                    <p class="text-muted-foreground mb-4">点击上方按钮创建积分套餐</p>
                    <Button onclick={openCreateDialog}>
                        <Plus class="mr-2 h-4 w-4" />
                        创建套餐
                    </Button>
                </div>
            {:else}
                <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>名称</Table.Head>
                                <Table.Head>积分</Table.Head>
                                <Table.Head>价格</Table.Head>
                                <Table.Head class="hidden md:table-cell">描述</Table.Head>
                                <Table.Head>状态</Table.Head>
                                <Table.Head>可见</Table.Head>
                                <Table.Head class="hidden sm:table-cell">创建时间</Table.Head>
                                <Table.Head class="text-right">操作</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each packages as pkg (pkg.id)}
                                <Table.Row class={pkg.isActive ? "" : "opacity-60"}>
                                    <Table.Cell class="font-medium">{pkg.name}</Table.Cell>
                                    <Table.Cell>{pkg.credits.toLocaleString()}</Table.Cell>
                                    <Table.Cell>{formatPrice(pkg.price)}</Table.Cell>
                                    <Table.Cell class="text-muted-foreground hidden max-w-48 truncate md:table-cell">
                                        {pkg.description ?? "-"}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if pkg.isActive}
                                            <Badge variant="default">启用</Badge>
                                        {:else}
                                            <Badge variant="secondary">停用</Badge>
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="h-7 w-7 p-0"
                                            onclick={() => toggleField(pkg, "isVisible")}
                                        >
                                            {#if pkg.isVisible}
                                                <Eye class="h-4 w-4 text-green-500" />
                                            {:else}
                                                <EyeOff class="h-4 w-4 text-muted-foreground" />
                                            {/if}
                                        </Button>
                                    </Table.Cell>
                                    <Table.Cell class="text-muted-foreground hidden text-sm sm:table-cell">
                                        {formatDate(pkg.createdAt)}
                                    </Table.Cell>
                                    <Table.Cell class="text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" onclick={() => openEditDialog(pkg)}>
                                                <Pencil class="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onclick={() => toggleField(pkg, "isActive")}
                                            >
                                                {pkg.isActive ? "停用" : "启用"}
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                {#if total > limit}
                    <Pagination
                        count={total}
                        perPage={limit}
                        bind:page
                        class="mt-4"
                    />
                {/if}
            {/if}
        </Card.Content>
    </Card.Root>
</div>

<!-- Create/Edit Dialog -->
<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>{editing ? "编辑套餐" : "创建套餐"}</Dialog.Title>
            <Dialog.Description>
                {editing ? "修改套餐信息" : "填写以下信息创建新的积分套餐"}
            </Dialog.Description>
        </Dialog.Header>
        <form
            class="flex flex-col gap-4"
            onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        >
            <div class="space-y-2">
                <Label for="pkg-name">套餐名称</Label>
                <Input
                    id="pkg-name"
                    bind:value={formName}
                    placeholder="例如：基础套餐"
                    disabled={submitting}
                />
            </div>
            <div class="space-y-2">
                <Label for="pkg-credits">积分数量</Label>
                <Input
                    id="pkg-credits"
                    type="number"
                    bind:value={formCredits}
                    placeholder="例如：100"
                    min="1"
                    disabled={submitting}
                />
            </div>
            <div class="space-y-2">
                <Label for="pkg-price">价格（分）</Label>
                <Input
                    id="pkg-price"
                    type="number"
                    bind:value={formPrice}
                    placeholder="例如：990 表示 ¥9.90"
                    min="0"
                    disabled={submitting}
                />
            </div>
            <div class="space-y-2">
                <Label for="pkg-desc">描述（可选）</Label>
                <Textarea
                    id="pkg-desc"
                    bind:value={formDescription}
                    placeholder="套餐描述"
                    disabled={submitting}
                />
            </div>
            <Dialog.Footer>
                <Button variant="outline" type="button" onclick={() => (dialogOpen = false)} disabled={submitting}>
                    取消
                </Button>
                <Button type="submit" disabled={submitting}>
                    {#if submitting}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        提交中...
                    {:else}
                        {editing ? "保存" : "创建"}
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
