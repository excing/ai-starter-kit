<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Loader2, RefreshCw, Zap, Check, X } from '@lucide/svelte';
	import { aiProxyStore } from '$lib/stores/ai-proxy';

	let { mode, open = $bindable() }: { mode: 'create' | 'edit'; open: boolean } = $props();

	const isEdit = $derived(mode === 'edit');

	function parseModels(input: string): string[] {
		if (!input.trim()) return [];
		return input
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	function isModelSelected(model: string): boolean {
		return parseModels(aiProxyStore.proxyForm.models).includes(model);
	}

	function toggleModel(model: string) {
		const current = parseModels(aiProxyStore.proxyForm.models);
		if (current.includes(model)) {
			aiProxyStore.proxyForm.models = current.filter((m) => m !== model).join(', ');
		} else {
			aiProxyStore.proxyForm.models = [...current, model].join(', ');
		}
	}

	function toggleAllModels() {
		const current = parseModels(aiProxyStore.proxyForm.models);
		if (current.length === aiProxyStore.availableModels.length) {
			aiProxyStore.proxyForm.models = '';
		} else {
			aiProxyStore.proxyForm.models = aiProxyStore.availableModels.join(', ');
		}
	}

	function handleSubmit() {
		if (isEdit) {
			aiProxyStore.updateProxy();
		} else {
			aiProxyStore.createProxy();
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{isEdit ? '编辑 Proxy' : '添加 Proxy'}</Dialog.Title>
			<Dialog.Description>{isEdit ? '修改 AI 服务代理配置' : '配置新的 AI 服务代理节点'}</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="proxy-name">名称 *</Label>
				<Input id="proxy-name" placeholder="例如：OpenAI 官方" bind:value={aiProxyStore.proxyForm.name} />
			</div>
			<div class="grid gap-2">
				<Label>Provider *</Label>
				<Select.Root type="single" bind:value={aiProxyStore.proxyForm.provider}>
					<Select.Trigger class="w-full">
						{#if aiProxyStore.proxyForm.provider === 'openai'}
							OpenAI
						{:else if aiProxyStore.proxyForm.provider === 'anthropic'}
							Anthropic
						{:else if aiProxyStore.proxyForm.provider === 'google'}
							Google
						{:else}
							请选择 Provider
						{/if}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="openai" label="OpenAI" />
						<Select.Item value="anthropic" label="Anthropic" />
						<Select.Item value="google" label="Google" />
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-2">
				<Label for="proxy-baseurl">Base URL *</Label>
				<Input
					id="proxy-baseurl"
					placeholder="https://api.openai.com/v1"
					bind:value={aiProxyStore.proxyForm.baseUrl}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="proxy-apikey">{isEdit ? 'API Key（留空则不修改）' : 'API Key *'}</Label>
				<div class="flex gap-2">
					<Input
						id="proxy-apikey"
						type="password"
						placeholder={isEdit ? '留空保持不变' : 'sk-...'}
						bind:value={aiProxyStore.proxyForm.apiKey}
						class="flex-1"
					/>
					{#if !isEdit || aiProxyStore.proxyForm.apiKey}
						<Button
							variant="outline"
							size="icon"
							class="shrink-0"
							onclick={() => aiProxyStore.fetchModelsFromForm()}
							disabled={aiProxyStore.loadingModels ||
								!aiProxyStore.proxyForm.baseUrl ||
								!aiProxyStore.proxyForm.apiKey}
							title="获取模型列表"
						>
							{#if aiProxyStore.loadingModels}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								<RefreshCw class="h-4 w-4" />
							{/if}
						</Button>
					{/if}
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="proxy-models">支持的模型（逗号分隔）</Label>
				<Input
					id="proxy-models"
					placeholder="gpt-4o, gpt-4o-mini, o1"
					bind:value={aiProxyStore.proxyForm.models}
				/>
				{#if isEdit && !aiProxyStore.proxyForm.apiKey}
					<p class="text-xs text-muted-foreground">填写 API Key 后可获取模型列表</p>
				{/if}
				{#if aiProxyStore.availableModels.length > 0}
					<div class="rounded-md border p-2">
						<div class="flex items-center justify-between mb-2">
							<span class="text-xs font-medium text-muted-foreground">
								快捷选择模型
								<span class="text-muted-foreground/60"
									>({aiProxyStore.availableModels.length})</span
								>
							</span>
							<Button variant="link" size="sm" class="h-auto p-0 text-xs" onclick={toggleAllModels}>
								{parseModels(aiProxyStore.proxyForm.models).length ===
								aiProxyStore.availableModels.length
									? '取消全选'
									: '全选'}
							</Button>
						</div>
						<div class="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto">
							{#each aiProxyStore.availableModels as model}
								{@const testStatus = aiProxyStore.modelTestStatus.get(model)}
								<div class="inline-flex items-center gap-0.5">
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
										class="h-4 w-4 {testStatus === 'success'
											? 'text-green-600'
											: testStatus === 'failed'
												? 'text-destructive'
												: 'text-muted-foreground hover:text-foreground'}"
										title={testStatus === 'success'
											? '可用'
											: testStatus === 'failed'
												? '不可用'
												: '测试模型'}
										disabled={testStatus === 'testing'}
										onclick={() => aiProxyStore.testModel(model)}
									>
										{#if testStatus === 'testing'}
											<Loader2 class="h-3 w-3 animate-spin" />
										{:else if testStatus === 'success'}
											<Check class="h-3 w-3" />
										{:else if testStatus === 'failed'}
											<X class="h-3 w-3" />
										{:else}
											<Zap class="h-3 w-3" />
										{/if}
									</Button>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="proxy-priority">优先级</Label>
					<Input
						id="proxy-priority"
						type="number"
						bind:value={aiProxyStore.proxyForm.priority}
					/>
				</div>
				<div class="flex items-end gap-2">
					<label class="flex items-center gap-2 text-sm">
						<Checkbox bind:checked={aiProxyStore.proxyForm.isActive} />
						启用
					</label>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>取消</Button>
			<Button onclick={handleSubmit} disabled={aiProxyStore.savingProxy}>
				{#if aiProxyStore.savingProxy}
					<Loader2 class="mr-1.5 h-4 w-4 animate-spin" />
				{/if}
				{isEdit ? '保存' : '创建'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
