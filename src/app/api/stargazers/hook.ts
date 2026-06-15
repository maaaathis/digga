'use client';

import useSWR from 'swr';

import type { StargazersSummary } from './route';

const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<StargazersSummary>);

export function useStargazers() {
	return useSWR<StargazersSummary>('/api/stargazers', fetcher, {
		revalidateOnFocus: false,
		revalidateIfStale: false,
		dedupingInterval: 60 * 60 * 1000,
	});
}
