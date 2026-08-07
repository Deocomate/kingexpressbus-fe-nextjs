"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchPaginated } from "@/services/admin-api";
export function useAdminList(resourcePath, pageSize = 25, extraParams = {}) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();
  const extraKey = JSON.stringify(extraParams);
  const query = useQuery({
    queryKey: ["admin-list", resourcePath, page, pageSize, q, extraKey],
    queryFn: () => fetchPaginated(resourcePath, {
      page,
      page_size: pageSize,
      q,
      extra: extraParams
    }),
    placeholderData: prev => prev
  });
  function search(next) {
    setQ(next);
    setPage(1);
  }
  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["admin-list", resourcePath]
    });
  }
  return {
    query,
    page,
    setPage,
    q,
    search,
    pageSize,
    invalidate
  };
}