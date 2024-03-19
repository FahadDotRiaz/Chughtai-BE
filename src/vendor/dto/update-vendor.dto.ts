import { PartialType } from '@nestjs/swagger';
import { VendorDto } from './create-vendor.dto';

export class UpdateVendorDto extends PartialType(VendorDto) {}