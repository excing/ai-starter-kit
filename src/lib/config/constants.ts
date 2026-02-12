/**
 * 应用全局常量配置
 */

// ─── 分页 ───────────────────────────────────────────────────

export const PAGINATION = {
	/** 统一每页数量 */
	DEFAULT_LIMIT: 20,
	/** 最大每页数量 */
	MAX_LIMIT: 100,
	/** 默认偏移量 */
	DEFAULT_OFFSET: 0,
} as const;

/**
 * 安全解析分页参数，防止 NaN、负数、超大值
 */
export function parsePagination(url: URL): { limit: number; offset: number } {
	const rawLimit = parseInt(url.searchParams.get('limit') || '');
	const rawOffset = parseInt(url.searchParams.get('offset') || '');
	return {
		limit: Number.isNaN(rawLimit) || rawLimit < 1 ? PAGINATION.DEFAULT_LIMIT : Math.min(rawLimit, PAGINATION.MAX_LIMIT),
		offset: Number.isNaN(rawOffset) || rawOffset < 0 ? PAGINATION.DEFAULT_OFFSET : rawOffset,
	};
}

// ─── AI Proxy ───────────────────────────────────────────────

export const AI_PROVIDER = {
	/** OpenAI */
	OPENAI: 'openai',
	/** Anthropic */
	ANTHROPIC: 'anthropic',
	/** Google */
	GOOGLE: 'google',
} as const;

export const HEALTH_STATUS = {
	/** 健康 */
	HEALTHY: 'healthy',
	/** 不健康 */
	UNHEALTHY: 'unhealthy',
} as const;
