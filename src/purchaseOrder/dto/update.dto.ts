import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseOrderDto } from './purchase-order.dto';


export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {}
