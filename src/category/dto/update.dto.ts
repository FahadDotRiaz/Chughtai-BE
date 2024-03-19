import { PartialType } from '@nestjs/swagger';
import { CategoryDto } from './create.dto';


export class UpdateCategoryDto extends PartialType(CategoryDto) {}
