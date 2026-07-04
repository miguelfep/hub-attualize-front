'use client';

import { useMemo } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';

export async function getBanners() {
  const res = await axios.get(endpoints.banners.root);
  return res.data;
}

export async function getBannersPublicos() {
  const res = await axios.get(endpoints.banners.publicos);
  return res.data;
}

export async function createBanner(payload) {
  const res = await axios.post(endpoints.banners.root, payload);
  await globalMutate(endpoints.banners.root);
  return res.data;
}

export async function updateBanner(id, payload) {
  const res = await axios.put(endpoints.banners.details(id), payload);
  await globalMutate(endpoints.banners.root);
  return res.data;
}

export async function deleteBanner(id) {
  const res = await axios.delete(endpoints.banners.details(id));
  await globalMutate(endpoints.banners.root);
  return res.data;
}

export function useGetBanners() {
  const { data, isLoading, error, mutate } = useSWR(endpoints.banners.root, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return useMemo(
    () => ({
      banners: data?.data || [],
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}
