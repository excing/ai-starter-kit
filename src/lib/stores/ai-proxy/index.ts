/**
 * AI Proxy Store — barrel re-export
 */

export { aiProxyProxiesStore } from './proxies.svelte';
export { aiProxyAssignmentsStore } from './assignments.svelte';
export { aiProxyStore } from './facade.svelte';

export type {
	AiProxyItem,
	AiProxyAssignment,
	ProxyFormData,
	AssignmentFormData,
} from '$lib/types/admin';
