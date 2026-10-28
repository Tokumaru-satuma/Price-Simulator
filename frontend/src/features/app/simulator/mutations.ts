"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  calculateSimulation,
  createCalculationScenario,
  createCustomer,
  createPriceCoefficient,
  updateCustomer,
  updatePriceCoefficient,
} from "./api";
import { simulatorQueryKey } from "./queries";
import type {
  CalculationRequest,
  CalculationResult,
  CreateCustomerPayload,
  PriceCoefficient,
  UpdateCustomerPayload,
} from "./types";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...simulatorQueryKey, "customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: UpdateCustomerPayload }) =>
      updateCustomer(uuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...simulatorQueryKey, "customers"] });
    },
  });
}

export function useCreatePriceCoefficient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<PriceCoefficient, "uuid" | "created_at" | "updated_at">) =>
      createPriceCoefficient(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...simulatorQueryKey, "price-coefficients"] });
    },
  });
}

export function useUpdatePriceCoefficient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: Partial<PriceCoefficient> }) =>
      updatePriceCoefficient(uuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...simulatorQueryKey, "price-coefficients"] });
    },
  });
}

export function useCreateCalculationScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      customer: string;
      calculation_date: string;
      organization_type: string;
      broadcast_frequency: string;
      user_count: number;
      note?: string;
    }) => createCalculationScenario(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...simulatorQueryKey, "scenarios"] });
    },
  });
}

export function useCalculateSimulation() {
  return useMutation({
    mutationFn: (payload: CalculationRequest): Promise<CalculationResult> =>
      calculateSimulation(payload),
  });
}
