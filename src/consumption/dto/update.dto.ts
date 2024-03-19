import { PartialType } from '@nestjs/swagger';
import { CreateConsumptionDTO } from './create.dto';

export class UpdateConsumptionDto extends PartialType(CreateConsumptionDTO) {}
