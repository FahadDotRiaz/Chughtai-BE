import { PartialType } from '@nestjs/swagger';
import { RackDto } from './create.dto';


export class UpdateRackDto extends PartialType(RackDto) {}
