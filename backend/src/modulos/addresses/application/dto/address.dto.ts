import { DeepPartial } from "@/common/domain/types/DeepPartial";

export interface CreateAddressDto {
  establishmentId?: string;
  userId?: string;
  customerId?: string;
  stateId?: string;
  cityId?: string;
  stateLegacy?: string;
  cityLegacy?: string;
  zipCode?: string;
  addressNumber?: string;
  neighborhood?: string;
  street?: string;
  complement?: string;
  reference?: string;
}

export interface UpdateAddressDto extends DeepPartial<CreateAddressDto> {}

export interface AddressPresenterDto extends CreateAddressDto {
  id: string;
}

export const createAddressRawExample: CreateAddressDto = {
  establishmentId: "00000000-0000-4000-8000-000000000000",
  userId: "00000000-0000-4000-8000-000000000001",
  customerId: "00000000-0000-4000-8000-000000000002",
  stateId: "00000000-0000-4000-8000-000000000003",
  cityId: "00000000-0000-4000-8000-000000000004",
  stateLegacy: "SP",
  cityLegacy: "São Paulo",
  zipCode: "01000-000",
  addressNumber: "100",
  neighborhood: "Centro",
  street: "Rua Exemplo",
  complement: "Sala 01",
  reference: "Próximo à praça",
};

export const addressPresenterRawExample: AddressPresenterDto = {
  id: "00000000-0000-4000-8000-000000000000",
  ...createAddressRawExample,
};
