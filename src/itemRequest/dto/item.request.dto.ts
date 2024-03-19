import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiConsumes, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CustomItemStatus,
  DemandType,
  RequestStage,
  RequestStatus,
} from '../../utils/constant';

export class ImageDTO {
  @ApiProperty()
  file: string; // Change the type to 'any' or 'Buffer' if necessary
}

export class CustomItemDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @ValidateNested({ each: true })
  @Type(() => ImageDTO)
  @IsArray()
  @ApiProperty({ type: [ImageDTO] })
  images: ImageDTO[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CustomItemStatus)
  status?: CustomItemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  acceptedItemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  suggestedItems?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  remarks?: string;

  @IsOptional()
  itemId?: number;
}

export class ItemRequestItemDTO {
  @IsNotEmpty()
  @ApiProperty()
  quantity: number;

  @IsOptional()
  issuedQuantity?: number;

  @IsOptional()
  @ApiProperty()
  approvedQuantity: number;

  @IsOptional()
  @ApiProperty()
  suggestedQty: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  suggestedItemId: string;

  @IsNotEmpty()
  @ApiProperty()
  itemId: string;
}
@ApiConsumes('multipart/form-data')
export class ItemRequestDTO {
  @IsOptional()
  @IsNotEmpty()
  mirNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fromDepartment: string;

  // @IsString()
  // @IsNotEmpty()
  // @ApiProperty()
  // toLocation: string;

  @IsEnum(DemandType)
  @IsOptional()
  @ApiProperty({ enum: DemandType, default: DemandType.RECURRENT })
  demandType?: DemandType = DemandType.RECURRENT;

  @IsOptional()
  @IsString()
  reqNo?: string;

  @ValidateNested({ each: true })
  @Type(() => ItemRequestItemDTO)
  @IsArray()
  @ApiProperty({ type: [ItemRequestItemDTO] })
  items: ItemRequestItemDTO[];

  @ValidateNested({ each: true })
  @Type(() => CustomItemDTO)
  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [CustomItemDTO] }) // Use [CustomItemDTO] to indicate an array
  customItems?: CustomItemDTO[];

  @IsOptional()
  @ApiPropertyOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(RequestStage)
  stage: RequestStage;

  @IsOptional()
  @ApiProperty()
  remarks: string;

  @IsOptional()
  @ApiProperty()
  rejectedReason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  scheduledDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  createdBy: string;
}
