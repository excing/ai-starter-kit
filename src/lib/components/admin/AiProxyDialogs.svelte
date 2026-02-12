<script lang="ts">
	import ProxyFormDialog from './ProxyFormDialog.svelte';
	import AssignmentFormDialog from './AssignmentFormDialog.svelte';
	import { aiProxyStore } from '$lib/stores/ai-proxy';
</script>

<ProxyFormDialog mode="create" bind:open={aiProxyStore.createProxyDialogOpen} />
<ProxyFormDialog mode="edit" bind:open={aiProxyStore.editProxyDialogOpen} />

<AssignmentFormDialog mode="create" bind:open={aiProxyStore.createAssignmentDialogOpen} />
<AssignmentFormDialog mode="edit" bind:open={aiProxyStore.editAssignmentDialogOpen} />
