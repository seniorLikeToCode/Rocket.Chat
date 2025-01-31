import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

type Variant = 'success' | 'warning' | 'danger';

const getProgressBarValues = (numberOfEnabledApps: number, enabledAppsLimit: number): { variant: Variant; percentage: number } => ({
	variant: 'success',
	...(numberOfEnabledApps + 1 === enabledAppsLimit && { variant: 'warning' }),
	...(numberOfEnabledApps >= enabledAppsLimit && { variant: 'danger' }),
	percentage: Math.round((numberOfEnabledApps / enabledAppsLimit) * 100),
});

export const useAppsCountQuery = (context: 'private' | 'explore' | 'installed' | 'enterprise' | 'requested') => {
	const getAppsCount = useEndpoint('GET', '/apps/count');

	return useQuery(
		['apps/count', { context }],
		async () => {
			const data = await getAppsCount();

			const numberOfEnabledApps = context === 'private' ? data.totalPrivateEnabled : data.totalMarketplaceEnabled;
			const enabledAppsLimit = context === 'private' ? data.maxPrivateApps : data.maxMarketplaceApps;
			const hasUnlimitedApps = enabledAppsLimit === -1;
			return {
				hasUnlimitedApps,
				enabled: numberOfEnabledApps,
				limit: enabledAppsLimit,
				...getProgressBarValues(numberOfEnabledApps, enabledAppsLimit),
			};
		},
		{ staleTime: 10_000 },
	);
};

export const useInvalidateAppsCountQueryCallback = () => {
	const queryClient = useQueryClient();
	return useCallback(() => {
		queryClient.invalidateQueries(['apps/count']);
	}, [queryClient]);
};
