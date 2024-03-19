// response.dto.ts

import { PurchaseRequest } from 'src/entities/purchaseRequest.entity';
import { ItemData } from 'src/utils/constant';
export class getPurchaseResponseDto {
  readonly comments: string;
  readonly store: string;
  readonly items: ItemData[];
  readonly createdBy: { id: string };
  readonly internalComment: string | null;
  readonly id: string;
  readonly isActive: boolean;
  readonly isArchived: boolean;
  readonly createDateTime: Date;
  readonly lastChangedDateTime: Date;
  readonly requestCode: string;

  constructor(data: PurchaseRequest) {
    this.comments = data.comments;
    this.store = data?.store?.name;
    this.items =
      data?.items?.map((item) => {
        const itemData: ItemData = {
          itemId: item.item.id,
          itemCode: item.item.itemCode,
          quantity: item.quantity,
          remarks: item.remarks,
          discount: item.discount,
          salesTax: item.salesTax,
          federalTax: item.federalTax,
          deliveryDate: item.deliveryDate,
        };

        return itemData;
      }) || [];
    this.createdBy = data.createdBy;
    this.internalComment = data.internalComment;
    this.id = data.id;
    this.isActive = data.isActive;
    this.isArchived = data.isArchived;
    this.createDateTime = data.createDateTime;
    this.lastChangedDateTime = data.lastChangedDateTime;
    this.requestCode = data.requestCode;
  }
}
