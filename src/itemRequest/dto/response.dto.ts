// response.dto.ts
export class VersionHistoryResponseDto {
  readonly mirNumber: string;
  readonly demandType: string;
  readonly items: any;
  readonly sin: any;
  readonly internalComment: string | null;
  readonly id: string;
  readonly isActive: boolean;
  readonly isScheduled: boolean;
  readonly isArchived: boolean;
  readonly createDateTime: Date;
  readonly lastChangedDateTime: Date;
  readonly reqNo: string;
  readonly status: string;
  readonly stage: string;
  readonly remarks: string;
  readonly scheduledDate: string;
  readonly scheduledTime: string;

  constructor(data: any) {
    this.mirNumber = data.mirNumber;
    this.demandType = data.demandType;
    this.items =
      data?.items?.map((item) => {
        const itemData: any = {
          itemId: item.item.id,
          itemCode: item.item.itemCode,
          quantity: item.quantity,
          name: item.item.name,
          description: item.item.name,
          approvedQuantity: item.approvedQuantity,
          issuedQuantity: item.issuedQuantity,
          totalInventoryQty: item.totalInventoryQty,
          balance: item.balance,
          pending: item.pending,
          cancel: item.cancel,
          approvalStatus: item.approvalStatus,
        };

        return itemData;
      }) || [];
    this.isScheduled = data.isScheduled;
    this.internalComment = data.internalComment;
    this.id = data.id;
    this.isActive = data.isActive;
    this.isArchived = data.isArchived;
    this.createDateTime = data.createDateTime;
    this.lastChangedDateTime = data.lastChangedDateTime;
    this.reqNo = data.reqNo;
    this.scheduledDate = data.scheduledDate;
    this.scheduledTime = data.scheduledTime;
    this.status = data.status;
    this.stage = data.stage;
    this.remarks = data.remarks;

    this.sin = Array.isArray(data.sin)
      ? data.sin.map((sinItem: any) => ({
          id: sinItem.id,
          isActive: sinItem.isActive,
          isArchived: sinItem.isArchived,
          createDateTime: sinItem.createDateTime,
          lastChangedDateTime: sinItem.lastChangedDateTime,
          internalComment: sinItem.internalComment,
          sinNumber: sinItem.sinNumber,
          sinItems: Array.isArray(sinItem.sinItems)
            ? sinItem.sinItems.map((sinSubItem: any) => ({
                quantity: sinSubItem.quantity,
                id: sinSubItem.item.id,
                name: sinSubItem.item.name,
                itemCode: sinSubItem.item.itemCode,
                description: sinSubItem.item.description,
              }))
            : [],
        }))
      : [];
  }
}
