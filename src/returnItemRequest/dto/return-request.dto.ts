import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiConsumes, ApiProperty } from '@nestjs/swagger';
import {
  RequestStage,
  RequestStatus,
  ReturnReasonType,
} from '../../utils/constant';
import { ImageDTO } from 'src/itemRequest/dto/item.request.dto';

export class ReturnItemDTO {
  @IsNotEmpty()
  @ApiProperty()
  returnQuantity: number;

  @IsEnum(ReturnReasonType)
  @IsOptional()
  @ApiProperty({ enum: ReturnReasonType, default: ReturnReasonType.RETURN })
  type?: ReturnReasonType = ReturnReasonType.RETURN;

  @IsOptional()
  @ApiProperty()
  returnReason: string;

  @ApiProperty()
  estimatedPrice: number;

  @IsOptional()
  @ApiProperty()
  rejectedReason: string;

  @ApiProperty()
  totalQuantity: number;

  @IsNotEmpty()
  @ApiProperty()
  itemId: string;

  @ApiProperty()
  sinId: string;

  @ValidateNested({ each: true })
  @Type(() => ImageDTO)
  @IsArray()
  @ApiProperty({ type: [ImageDTO] })
  images: ImageDTO[];
}

export class SinItems {
  // @ApiProperty()
  // sinId: string;

  @ValidateNested({ each: true })
  @Type(() => ReturnItemDTO)
  @IsArray()
  @ApiProperty({ type: [ReturnItemDTO] })
  items: ReturnItemDTO[];
}

@ApiConsumes('multipart/form-data')
export class ItemReturnRequestDTO {
  @IsOptional()
  mrrNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fromDepartment: string;

  @IsString()
  @IsNotEmpty()
  toDepartment: string;

  // @ValidateNested({ each: true })
  // @Type(() => SinItems)
  // @IsArray()
  // @ApiProperty({ type: [SinItems] })
  // sinItems: SinItems[];

  @ValidateNested({ each: true })
  @Type(() => ReturnItemDTO)
  @IsArray()
  @ApiProperty({ type: [ReturnItemDTO] })
  items: ReturnItemDTO[];

  @IsOptional()
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  @IsEnum(RequestStage)
  stage: RequestStage;

  @IsOptional()
  @ApiProperty()
  rejectedReason: string;

  @IsOptional()
  @ApiProperty()
  remarks: string;

  @IsOptional()
  @ApiProperty()
  batchStock: number;

  // @IsNotEmpty()
  // @ApiProperty()
  // storeIssuedNote: string;

  @ValidateNested({ each: true })
  @Type(() => ImageDTO)
  @IsArray()
  @ApiProperty({ type: [ImageDTO] })
  proofOfDisposal: ImageDTO[];
}
