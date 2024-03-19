import { ItemData } from 'src/utils/constant';

// response.dto.ts
export class getPurchaseOrderResponseDto {
  readonly id: string;
  readonly isActive: boolean;
  readonly isArchived: boolean;
  readonly createDateTime: Date;
  readonly lastChangedDateTime: Date;
  readonly internalComment: string | null;
  readonly poCode: string;
  readonly remarks: string;
  readonly deliveryDate: string;
  readonly freight: string;
  readonly deliveryTerms: string;
  readonly paymentTerms: string;
  readonly currency: string;
  readonly vendor: any;
  readonly department: any;
  readonly items: ItemData[];
  readonly gatePass: any;

  constructor(data: any) {
    this.id = data?.id;
    this.isActive = data.isActive;
    this.isArchived = data.isArchived;
    this.createDateTime = data.createDateTime;
    this.lastChangedDateTime = data.lastChangedDateTime;
    this.internalComment = data.internalComment;
    this.poCode = data.poCode;
    this.remarks = data.remarks;
    this.deliveryDate = data.deliveryDate;
    this.freight = data.freight;
    this.deliveryTerms = data.deliveryTerms;
    this.paymentTerms = data.paymentTerms;
    this.currency = data.currency;
    this.items =
      data?.items?.map((item) => {
        const itemData: ItemData = {
          itemId: item?.item?.id,
          itemCode: item?.item?.itemCode,
          quantity: item?.quantity,
          remarks: item?.remarks,
          description: item?.item?.description,
          name: item?.item?.name,
          discount: item?.discount,
          salesTax: item?.salesTax,
          federalTax: item?.federalTax,
          deliveryDate: item?.deliveryDate,
          totalCancelQty: item?.totalCancelQty,
          totalPendingQty: item?.totalPendingQty,
          totalGrnQty: item.totalGrnQty,
        };

        return itemData;
      }) || [];
    this.vendor = data?.vendor && {
      id: data?.vendor?.id,
      name: data.vendor.name,
    };
    this.gatePass = data?.gatePass;
    this.department = data?.department && {
      id: data?.department?.id,
      name: data?.department?.name,
      location: {
        id: data?.department?.location.id,
        isActive: data.department?.location.isActive,
        isArchived: data.department?.location.isArchived,
        createDateTime: data.department?.location.createDateTime,
        lastChangedDateTime: data.department?.location.lastChangedDateTime,
        internalComment: data.department?.location.internalComment,
        name: data.department.location.name,
        address: data.department.location.address,
        service: data.department.location.service,
      },
    };
  }
}
