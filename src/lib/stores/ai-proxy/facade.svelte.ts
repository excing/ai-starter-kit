/**
 * AI Proxy Store — 统一门面（向后兼容）
 */

import { aiProxyProxiesStore } from './proxies.svelte';
import { aiProxyAssignmentsStore } from './assignments.svelte';

class AiProxyStoreFacade {
	// Tab 状态
	activeTab = $state<'proxies' | 'assignments'>('proxies');

	// ---- Proxies ----
	get proxies() { return aiProxyProxiesStore.proxies; }
	get operatingItems() { return aiProxyProxiesStore.operatingItems; }
	set operatingItems(v) { aiProxyProxiesStore.operatingItems = v; }
	get createProxyDialogOpen() { return aiProxyProxiesStore.createProxyDialogOpen; }
	set createProxyDialogOpen(v) { aiProxyProxiesStore.createProxyDialogOpen = v; }
	get editProxyDialogOpen() { return aiProxyProxiesStore.editProxyDialogOpen; }
	set editProxyDialogOpen(v) { aiProxyProxiesStore.editProxyDialogOpen = v; }
	get proxyForm() { return aiProxyProxiesStore.proxyForm; }
	set proxyForm(v) { aiProxyProxiesStore.proxyForm = v; }
	get savingProxy() { return aiProxyProxiesStore.savingProxy; }
	set savingProxy(v) { aiProxyProxiesStore.savingProxy = v; }
	get availableModels() { return aiProxyProxiesStore.availableModels; }
	set availableModels(v) { aiProxyProxiesStore.availableModels = v; }
	get loadingModels() { return aiProxyProxiesStore.loadingModels; }
	set loadingModels(v) { aiProxyProxiesStore.loadingModels = v; }
	get modelTestStatus() { return aiProxyProxiesStore.modelTestStatus; }
	set modelTestStatus(v) { aiProxyProxiesStore.modelTestStatus = v; }

	isOperating(id: string) { return aiProxyProxiesStore.isOperating(id); }
	loadProxies() { return aiProxyProxiesStore.loadProxies(); }
	createProxy() { return aiProxyProxiesStore.createProxy(); }
	updateProxy() {
		return aiProxyProxiesStore.updateProxy(
			() => aiProxyAssignmentsStore.silentReloadAssignments()
		);
	}
	deleteProxy(id: string) {
		return aiProxyProxiesStore.deleteProxy(
			id, () => aiProxyAssignmentsStore.silentReloadAssignments()
		);
	}
	resetHealth(id: string) {
		return aiProxyProxiesStore.resetHealth(
			id, (proxyId, status) => aiProxyAssignmentsStore.patchAssignmentHealthStatus(proxyId, status)
		);
	}
	openEditProxyDialog(...args: Parameters<typeof aiProxyProxiesStore.openEditProxyDialog>) {
		return aiProxyProxiesStore.openEditProxyDialog(...args);
	}
	resetProxyForm() { return aiProxyProxiesStore.resetProxyForm(); }
	fetchModelsFromForm() { return aiProxyProxiesStore.fetchModelsFromForm(); }
	testModel(model: string) { return aiProxyProxiesStore.testModel(model); }
	getProxyModels(id: string) { return aiProxyProxiesStore.getProxyModels(id); }

	// ---- Assignments ----
	get assignments() { return aiProxyAssignmentsStore.assignments; }
	get createAssignmentDialogOpen() { return aiProxyAssignmentsStore.createAssignmentDialogOpen; }
	set createAssignmentDialogOpen(v) { aiProxyAssignmentsStore.createAssignmentDialogOpen = v; }
	get editAssignmentDialogOpen() { return aiProxyAssignmentsStore.editAssignmentDialogOpen; }
	set editAssignmentDialogOpen(v) { aiProxyAssignmentsStore.editAssignmentDialogOpen = v; }
	get assignmentForm() { return aiProxyAssignmentsStore.assignmentForm; }
	set assignmentForm(v) { aiProxyAssignmentsStore.assignmentForm = v; }
	get savingAssignment() { return aiProxyAssignmentsStore.savingAssignment; }
	set savingAssignment(v) { aiProxyAssignmentsStore.savingAssignment = v; }

	loadAssignments() { return aiProxyAssignmentsStore.loadAssignments(); }
	createAssignment() { return aiProxyAssignmentsStore.createAssignment(); }
	updateAssignment() { return aiProxyAssignmentsStore.updateAssignment(); }
	deleteAssignment(id: string) { return aiProxyAssignmentsStore.deleteAssignment(id); }
	openEditAssignmentDialog(...args: Parameters<typeof aiProxyAssignmentsStore.openEditAssignmentDialog>) {
		return aiProxyAssignmentsStore.openEditAssignmentDialog(...args);
	}
	resetAssignmentForm() { return aiProxyAssignmentsStore.resetAssignmentForm(); }

	// ---- Init ----
	init() {
		return Promise.all([
			aiProxyProxiesStore.loadProxies(),
			aiProxyAssignmentsStore.loadAssignments()
		]);
	}
}

export const aiProxyStore = new AiProxyStoreFacade();
