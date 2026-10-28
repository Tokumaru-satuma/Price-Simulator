import { api } from "@/lib/api/client";
import type { PaginatedData } from "@/lib/api/types";

import type {
  CalculationRequest,
  CalculationResult,
  CalculationScenario,
  ContactAddress,
  ContactAddressHistory,
  CreateCustomerPayload,
  Customer,
  PriceCoefficient,
  UpdateCustomerPayload,
} from "./types";

export async function getContactAddresses(page = 1): Promise<PaginatedData<ContactAddress>> {
  const response = await api.get<PaginatedData<ContactAddress>>(
    `/api/simulator/contact-addresses/?page=${page}`,
  );
  return response.data;
}

export async function createContactAddress(
  payload: Omit<ContactAddress, "uuid" | "created_at" | "updated_at">,
): Promise<ContactAddress> {
  const response = await api.post<ContactAddress>("/api/simulator/contact-addresses/", payload);
  return response.data;
}

export async function getCustomers(page = 1): Promise<PaginatedData<Customer>> {
  const response = await api.get<PaginatedData<Customer>>(`/api/simulator/customers/?page=${page}`);
  return response.data;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const response = await api.post<Customer>("/api/simulator/customers/", payload);
  return response.data;
}

export async function updateCustomer(
  uuid: string,
  payload: UpdateCustomerPayload,
): Promise<Customer> {
  const response = await api.patch<Customer>(`/api/simulator/customers/${uuid}/`, payload);
  return response.data;
}

export async function deleteCustomer(uuid: string): Promise<void> {
  await api.delete(`/api/simulator/customers/${uuid}/`);
}

export async function getPriceCoefficients(page = 1): Promise<PaginatedData<PriceCoefficient>> {
  const response = await api.get<PaginatedData<PriceCoefficient>>(
    `/api/simulator/price-coefficients/?page=${page}`,
  );
  return response.data;
}

export async function createPriceCoefficient(
  payload: Omit<PriceCoefficient, "uuid" | "created_at" | "updated_at">,
): Promise<PriceCoefficient> {
  const response = await api.post<PriceCoefficient>("/api/simulator/price-coefficients/", payload);
  return response.data;
}

export async function updatePriceCoefficient(
  uuid: string,
  payload: Partial<PriceCoefficient>,
): Promise<PriceCoefficient> {
  const response = await api.patch<PriceCoefficient>(`/api/simulator/price-coefficients/${uuid}/`, payload);
  return response.data;
}

export async function getCalculationScenarios(page = 1): Promise<PaginatedData<CalculationScenario>> {
  const response = await api.get<PaginatedData<CalculationScenario>>(
    `/api/simulator/scenarios/?page=${page}`,
  );
  return response.data;
}

export async function createCalculationScenario(
  payload: Omit<CalculationScenario, "uuid" | "customer" | "created_at" | "updated_at"> & {
    customer: string;
  },
): Promise<CalculationScenario> {
    const response = await api.post<CalculationScenario>("/api/simulator/scenarios/", payload);
  return response.data;
}

export async function calculateSimulation(payload: CalculationRequest): Promise<CalculationResult> {
  const response = await api.post<CalculationResult>("/api/simulator/scenarios/calculate/", payload);
  return response.data;
}

export async function getContactAddressHistory(
  contactAddressUuid: string,
  page = 1,
): Promise<PaginatedData<ContactAddressHistory>> {
  const response = await api.get<PaginatedData<ContactAddressHistory>>(
    `/api/simulator/contact-address-history/?contact_address=${contactAddressUuid}&page=${page}`,
  );
  return response.data;
}
