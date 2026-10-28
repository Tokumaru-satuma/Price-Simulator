export type ContactAddress = {
  id?: number;
  uuid: string;
  customer_name: string;
  representative_name: string;
  representative_tel: string;
  representative_address: string;
  created_at: string;
  updated_at: string;
};

export type ContactAddressHistory = {
  uuid: string;
  contact_address: ContactAddress;
  changed_by: string | null;
  previous_snapshot: Partial<ContactAddress>;
  new_snapshot: Partial<ContactAddress>;
  created_at: string;
};

export type Customer = {
  id: number;
  uuid: string;
  contact_address: ContactAddress;
  customer_name: string;
  representative_name: string;
  representative_tel: string;
  representative_address: string;
  user_count: number;
  organization_type: string;
  broadcast_frequency: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export type PriceCoefficient = {
  id: number;
  uuid: string;
  name: string;
  target_type: string;
  unit_price: string;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CalculationScenario = {
  uuid: string;
  customer: Customer;
  calculation_date: string;
  organization_type: string;
  broadcast_frequency: string;
  user_count: number;
  note: string;
  created_at: string;
  updated_at: string;
};

export type ContactAddressPayload = {
  customer_name: string;
  representative_name: string;
  representative_tel: string;
  representative_address: string;
};

export type CreateCustomerPayload = {
  contact_address: ContactAddressPayload;
  user_count: number;
  organization_type: string;
  broadcast_frequency: string;
  note?: string;
};

export type UpdateCustomerPayload = Partial<CreateCustomerPayload> & {
  contact_address?: Partial<ContactAddressPayload>;
};

export type CalculationRequest = {
  customer_id: number;
  calculation_date: string;
  organization_type: string;
  broadcast_frequency: string;
  user_count: number;
  note?: string;
};

export type CalculationResult = {
  customer: string;
  calculation_date: string;
  organization_type: string;
  broadcast_frequency: string;
  user_count: number;
  total_cost: string;
  applied_coefficient: {
    uuid: string;
    name: string;
    target_type: string;
    valid_from: string;
    valid_to: string | null;
    unit_price: string;
  };
};
