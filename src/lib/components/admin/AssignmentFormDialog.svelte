<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Loader2 } from '@lucide/svelte';
	import { aiProxyStore } from '$lib/stores/ai-proxy';

	let { mode, open = $bindable() }: { mode: 'create' | 'edit'; open: boolean } = $props();

	const isEdit = $derived(mode === 'edit');

	function providerLabel(p: string): string {
		const map: Record<string, string> = {
			openai: 'OpenAI',
			anthropic: 'Anthropic',
			google: 'Google'
		};
		return map[p] || p;
	}

	function parseModels(input: string): string[] {
		if (!input.trim()) return [];
		return input
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	function isModelSelected(model: string): boolean {
		return parseModels(aiProxyStore.assignmentForm.models).includes(model);
	}

	function toggleModel(model: string) {
		const current = parseModels(aiProxyStore.assignmentForm.models);
		if (current.includes(model)) {
			aiProxyStore.assignmentForm.models = current.filter((m) => m !== model).join(', ');
		} else {
			aiProxyStore.assignmentForm.models = [...current, model].join(', ');
		}
	}

	function setAsDefaultModel(model: string) {
		aiProxyStore.assignmentForm.defaultModel = model;
	}

	function getSelectedProxyModels(): string[] {
		return aiProxyStore.getProxyModels(aiProxyStore.assignmentForm.proxyId);
	}

	function handleSubmit() {
		if (isEdit) {
			aiProxyStore.updateAssignment();
		} else {
			aiProxyStore.createAssignment();
		}
	}

	function getSelectedProxyLabel(): string {
		const proxy = aiProxyStore.proxies.items.find(p => p.id === aiProxyStore.assignmentForm.proxyId);
		return proxy ? `${proxy.name} (${providerLabel(proxy.provider)})` : '请选择 Proxy';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{isEdit ? '编辑功能绑定' : '添加功能绑定'}</Dialog.Title>
			<Dialog.Description
				>{isEdit ? '修改功能的 AI Proxy 和模型配置' : '为功能分配 AI Proxy 和模型'}</Dialog.Description
			>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="asgn-name">名称 *</Label>
				<Input
					id="asgn-name"
					placeholder="例如：聊天功能 - Kimi"
					bind:value={aiProxyStore.assignmentForm.name}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="asgn-desc">描述</Label>
				<Input
					id="asgn-desc"
					placeholder="可选描述说明"
					bind:value={aiProxyStore.assignmentForm.description}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="asgn-feature">功能标识 *</Label>
				<Input
					id="asgn-feature"
					placeholder="例如：chat, image_generation"
					bind:value={aiProxyStore.assignmentForm.featureKey}
				/>
			</div>
			<div class="grid gap-2">
				<Label>Proxy *</Label>
				<Select.Root type="single" bind:value={aiProxyStore.assignmentForm.proxyId}>
					<Select.Trigger class="w-full">
						{#if aiProxyStore.assignmentForm.proxyId}
							{getSelectedProxyLabel()}
						{:else}
							请选择 Proxy
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each aiProxyStore.proxies.items as proxy}
							<Select.Item value={proxy.id} label="{proxy.name} ({providerLabel(proxy.provider)})" />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-2">
				<Label for="asgn-default-model">默认模型</Label>
				<Input
					id="asgn-default-model"
					placeholder="gpt-4o"
					bind:value={aiProxyStore.assignmentForm.defaultModel}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="asgn-models">可用模型范围（逗号分隔，留空表示全部）</Label>
				<Input
					id="asgn-models"
					placeholder="gpt-4o, gpt-4o-mini"
					bind:value={aiProxyStore.assignmentForm.models}
				/>
				{#if aiProxyStore.assignmentForm.proxyId}
					{@const proxyModels = getSelectedProxyModels()}
					{#if proxyModels.length > 0}
						<div class="rounded-md border p-2">
							<div class="flex items-center justify-between mb-2">
								<span class="text-xs font-medium text-muted-foreground">
									Proxy 已配置的模型
								</span>
							</div>
							<div class="flex flex-wrap gap-1.5">
								{#each proxyModels as model}
									<div class="inline-flex items-center gap-1">
										<Button
											variant={isModelSelected(model) ? 'default' : 'secondary'}
											size="sm"
											class="h-auto px-2 py-0.5 text-xs"
											onclick={() => toggleModel(model)}
										>
											{model}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											class="h-4 w-4 text-muted-foreground hover:text-primary"
											title="设为默认模型"
											onclick={() => setAsDefaultModel(model)}
										>
											{aiProxyStore.assignmentForm.defaultModel === model ? '★' : '☆'}
										</Button>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<p class="text-xs text-muted-foreground">
							该 Proxy 未配置模型列表，请先在 Proxy 配置中添加支持的模型
						</p>
					{/if}
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<label class="flex items-center gap-2 text-sm">
					<Checkbox bind:checked={aiProxyStore.assignmentForm.isActive} />
					启用
				</label>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>取消</Button>
			<Button onclick={handleSubmit} disabled={aiProxyStore.savingAssignment}>
				{#if aiProxyStore.savingAssignment}
					<Loader2 class="mr-1.5 h-4 w-4 animate-spin" />
				{/if}
				{isEdit ? '保存' : '创建'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
