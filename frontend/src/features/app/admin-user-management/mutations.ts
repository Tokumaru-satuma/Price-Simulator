"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAdminUser,
  deleteAdminUser,
  resetAdminUserPassword,
  restoreAdminUser,
  updateAdminUser,
} from "./api";
import { adminUserQueryKey } from "./queries";
import type { CreateUserPayload, UpdateUserPayload } from "./types";

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminUserQueryKey });
}

export function useSaveAdminUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (
      input:
        | { uuid: null; payload: CreateUserPayload }
        | { uuid: string; payload: UpdateUserPayload },
    ) => input.uuid === null
      ? createAdminUser(input.payload)
      : updateAdminUser(input.uuid, input.payload),
    onSuccess: invalidate,
  });
}

export function useSetAdminUserActive() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ uuid, isActive }: { uuid: string; isActive: boolean }) =>
      updateAdminUser(uuid, { is_active: isActive }),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: deleteAdminUser, onSuccess: invalidate });
}

export function useRestoreAdminUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: restoreAdminUser, onSuccess: invalidate });
}

export function useResetAdminUserPassword() {
  return useMutation({
    mutationFn: ({ uuid, password }: { uuid: string; password: string }) =>
      resetAdminUserPassword(uuid, password),
  });
}
