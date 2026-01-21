
export enum FieldType {
  TEXT = 'TEXT',
  DATE = 'DATE',
  SIGNATURE = 'SIGNATURE',
  CHECKBOX = 'CHECKBOX'
}

export interface FieldMetadata {
  id: string;
  type: FieldType;
  label: string;
  x: number;
  y: number;
}

export interface Blueprint {
  id: string;
  name: string;
  fields: FieldMetadata[];
  createdAt: number;
}

export enum ContractStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  SIGNED = 'SIGNED',
  LOCKED = 'LOCKED',
  REVOKED = 'REVOKED'
}

export interface Contract {
  id: string;
  blueprintId: string;
  blueprintName: string;
  name: string;
  status: ContractStatus;
  values: Record<string, string | boolean>;
  createdAt: number;
  history: { status: ContractStatus; timestamp: number }[];
}

export type ViewType = 'DASHBOARD' | 'CREATE_BLUEPRINT' | 'CREATE_CONTRACT' | 'VIEW_CONTRACT';
