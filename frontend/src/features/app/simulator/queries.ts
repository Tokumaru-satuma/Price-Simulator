"use client";

import { useQuery } from "@tanstack/react-query";

import { getCalculationScenarios, getContactAddresses, getCustomers, getPriceCoefficients } from "./api";

export const simulatorQueryKey = ["app", "simulator"] as const;

export function useContactAddresses(enabled = true) {
  return useQuery({
    queryKey: [...simulatorQueryKey, "contact-addresses"],
    queryFn: () => getContactAddresses(),
    enabled,
  });
}

export function useCustomers(enabled = true) {
  return useQuery({
    queryKey: [...simulatorQueryKey, "customers"],
    queryFn: () => getCustomers(),
    enabled,
  });
}

export function usePriceCoefficients(enabled = true) {
  return useQuery({
    queryKey: [...simulatorQueryKey, "price-coefficients"],
    queryFn: () => getPriceCoefficients(),
    enabled,
  });
}

export function useCalculationScenarios(enabled = true) {
  return useQuery({
    queryKey: [...simulatorQueryKey, "scenarios"],
    queryFn: () => getCalculationScenarios(),
    enabled,
  });
}
