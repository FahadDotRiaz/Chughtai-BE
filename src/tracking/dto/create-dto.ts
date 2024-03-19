export class CreateTrackingDto {
  type: string;
  action: string;
  mirId?: string;
  mrrId?: string;
  grnId?: string;
  userId?: string;
  isReview?: boolean;
  isItemReview?: boolean;
}
