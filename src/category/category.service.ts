import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CategoryDto } from './dto/create.dto';
import { Category } from 'src/entities/category.entity';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { UpdateCategoryDto } from './dto/update.dto';
import { Item } from 'src/entities/item.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async getCategoryById(categoryId: string) {
    try {
      return await this.categoryRepository.findOne({
        where: {
          id: categoryId,
          isArchived: false,
        },
      });
    } catch (error) {
      // If the location with the given ID is not found, handle the exception
      throw new NotFoundException(`category not found`);
    }
  }

  async createCategory(
    categoryData: CategoryDto | UpdateCategoryDto,
    id: string | null,
  ) {
    const { name } = categoryData;
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    const whereCondition: any = { name: trimmedName, isArchived: false };
    if (id) {
      whereCondition.id = Not(id);
    }
    const existingCategory = await this.categoryRepository.findOne({
      where: whereCondition,
    });
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }
    const updateCategory = id && (await this.getCategoryById(id));
    const category = updateCategory
      ? this.categoryRepository.merge(updateCategory, categoryData)
      : this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async getCategories(query: QueryDto, pagination: PaginationDto) {
    const { name, description, search } = query;
    const { page, limit } = pagination;
    const skip = (Number(page ?? 1) - 1) * Number(limit ?? 10);
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.isArchived = :isArchived', {
        isArchived: false,
      });

    // Applying filter conditions
    if (name) {
      queryBuilder.andWhere('category.name ILIKE :name', { name: `%${name}%` });
    }
    if (description) {
      queryBuilder.andWhere('category.description ILIKE :description', {
        description: `%${description}%`,
      });
    }
    if (search) {
      queryBuilder.andWhere(
        '(category.name LIKE :search OR category.description LIKE :search)',
        { search: `%${search}%` },
      );
    }
    const totalRows = await queryBuilder.getCount();
    // Applying pagination
    queryBuilder
      .orderBy('category.createDateTime', 'DESC')
      .skip(skip)
      .take(Number(limit ?? 10));

    // Execute the query
    const list = await queryBuilder.getMany();

    return { totalRows, list };
  }

  async deleteCategory(id: string) {
    const category = await this.getCategoryById(id);
    if (category) {
      const categoryCount = await this.itemRepository.count({
        where: { category: { id: category.id } },
      });
      if (categoryCount === 0) {
        category.isArchived = true;
        return await this.categoryRepository.save(category);
      } else {
        throw new ConflictException(
          `Can't delete Category this category associate with Item`,
        );
      }
    } else {
      throw new NotFoundException(`category not found`);
    }
  }
}
