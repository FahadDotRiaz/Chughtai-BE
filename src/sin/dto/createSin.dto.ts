// create-store-issued-note.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateItemSinDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  issuedQty: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  balance: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  cancel: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  totalIssue: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  totalCancel: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  pending: number;

  @ApiProperty()
  @IsNotEmpty()
  itemId: string;
}

export class CreateStoreIssuedNoteDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sinNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mir: string;

  @ValidateNested({ each: true })
  @Type(() => CreateItemSinDTO)
  @IsArray()
  @ApiProperty({ type: [CreateItemSinDTO] })
  items: CreateItemSinDTO[];
}
