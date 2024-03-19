import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseRequestDto } from './create.dto';


export class UpdatePurchaseRequestDto extends PartialType(CreatePurchaseRequestDto) {}