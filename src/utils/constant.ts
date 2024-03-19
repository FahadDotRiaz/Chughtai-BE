export enum DemandType {
  RECURRENT = 'Recurrent',
  ADHOC = 'Adhoc',
}

export enum ModuleType {
  Admin_Setting = 'Admin Setting',
  PROCUREMENT = 'Procurement',
  INVENTORY = 'Inventory',
  DEPARTMENT_SETTING = 'Department Setting',
  STORE_SETTING = 'Store Setting',
  SUPER_ADMIN = 'Super Admin',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  PARTIAL_ISSUED = 'PARTIAL_ISSUED',
  COMPLETED = 'COMPLETED',
  ISSUED = 'ISSUED',
}

export enum GrnStatus {
  PENDING = 'PENDING',
  HOD_APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  HOD_REJECTED = 'REJECTED',
  PARTIAL_COMPLETE = 'PARTIAL_COMPLETE',
}

export enum CustomItemStatus {
  REJECT = 'REJECT',
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
}

export enum DepartmentType {
  Store = 'Store',
  SubStore = 'SubStore',
  IT = 'IT',
  Maintenance = 'Maintenance',
  Others = 'Others',
}

export enum RequestStage {
  HOD_APPROVAL = 'HOD_APPROVAL',
  STORE_APPROVAL = 'STORE_APPROVAL',
  DEPARTMENT_APPROVAL = 'DEPARTMENT_APPROVAL',
  COMPLETED = 'COMPLETED',
  PARTIAL_COMPLETE = 'PARTIAL_COMPLETE',
}

export enum ReturnReasonType {
  RETURN = 'Return',
  DISPOSAL = 'Disposal',
}

export enum GatePassType {
  DedicateddVehilce = 'Dedicated Vehicle',
  HandCarry = 'Hand carry',
  Courier = 'Courier',
  Rent = 'Rent',
}

export enum TransportMode {
  Pickup = 'pickup',
  Delivery = 'delivery',
}

export enum ItemUnit {
  Box = 'Box',
  Pack = 'Pack',
  Item = 'Item',
}
export enum Service {
  Store = 'Store',
  CollectionCenter = 'CollectionCenter',
  StateLab = 'StateLab',
  SubStore = 'SubStore',
}

export enum VendorType {
  Goods = 'Store',
  Service = 'CollectionCenter',
}

export enum InwardOutward {
  Inward = 'Inward',
  Outward = 'Outward',
}

export interface ItemData {
  itemId: string;
  itemCode: string;
  name?: string;
  description?: string;
  quantity: number;
  remarks: string;
  discount: number;
  salesTax: number;
  federalTax: number;
  deliveryDate: string;
  totalCancelQty?: number;
  totalPendingQty?: number;
  totalGrnQty?: number;
}

export enum ActionsKeys {
  ADD = 'ADD',
  DELETE = 'DELETE',
}

export enum InventoryType {
  SELF = 'SELF',
  STORAGE = 'STORAGE',
}

export enum TrackingType {
  MIR = 'Item_Request',
  MRR = 'Return_Item_Request',
  GRN = 'Grn',
}

export enum TrackingActionType {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  HOD_APPROVED = 'HOD_APPROVED',
  HOD_REJECTED = 'HOD_REJECTED',
  STORE_ISSUED = 'STORE_ISSUED',
  STORE_ACCEPT = 'STORE_ACCEPT',
  ITEM_HOD_REVIEWED = ' ITEM_HOD_REVIEWED ',
}

export enum Currency {
  PKR = 'PKR',
  USD = 'USD',
  INR = 'INR',
}

export enum MirMenuType {
  MIR_REVIEW = 'item_requisition_form_review',
  MIR_GENERATE = 'item_requisition_form_generate',
  MIR_ISSUE = 'item_requisition_form_issue',
  MIR_DEPARTMENT_REVIEW = 'item_requisition_form_review_by_item',
}

export enum MrrMenuType {
  MRR_REVIEW = 'item_return_request_review',
  MRR_GENERATE = 'item_return_request_generate',
  MRR_ISSUE = 'item_return_request_issue',
  MIR_DEPARTMENT_REVIEW = 'item_return_request_review_by_item',
}
