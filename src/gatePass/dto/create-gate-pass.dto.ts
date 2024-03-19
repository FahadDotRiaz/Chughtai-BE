import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  GatePassType,
  InwardOutward,
  ItemUnit,
  TransportMode,
} from 'src/utils/constant';

const enumToTypeOptions = (enumType: any): ApiPropertyOptions => ({
  type: 'enum',
  enum: enumType,
});

export class CreateGatePassDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  driverName: string;

  @ApiProperty()
  @IsNotEmpty()
  driverId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  driverCell: string;

  @ApiProperty(enumToTypeOptions(GatePassType))
  @IsNotEmpty()
  @IsEnum(GatePassType)
  type: GatePassType;

  @ApiProperty(enumToTypeOptions(TransportMode))
  @IsNotEmpty()
  @IsEnum(TransportMode)
  transportMode: TransportMode;

  @ApiProperty(enumToTypeOptions(ItemUnit))
  @IsNotEmpty()
  @IsEnum(ItemUnit)
  itemUnit: ItemUnit;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  po: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  truckNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  outTime?: string;

  @ApiProperty(enumToTypeOptions(InwardOutward))
  @IsEnum(InwardOutward)
  inwardOutward: InwardOutward;
}
