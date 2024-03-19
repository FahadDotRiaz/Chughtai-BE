import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { VendorDto } from './dto/create-vendor.dto';
import { Vendor } from '../entities/vendor.entity';
import { Item } from 'src/entities/item.entity';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { vendorSearchFields } from 'src/utils/searchColumn';
import { generateRandomNumber } from 'src/utils/helper';
import { VendorItem } from 'src/entities/vendorItem.entity';
import { VendorResponseDto } from './dto/response.dto';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(VendorItem)
    private readonly vendorItemRepository: Repository<VendorItem>,
  ) {}

  async getVendorById(id: string): Promise<any> {
    const response = await this.vendorRepository
      .createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('vendor.country', 'country')
      .leftJoinAndSelect('vendor.province', 'province')
      .leftJoinAndSelect('vendor.city', 'city')
      .leftJoinAndSelect('vendor.area', 'area')
      .where('vendor.isArchived = :isArchived', { isArchived: false })
      .andWhere('vendor.id = :id', { id: id })
      .getOne();
    if (!response) {
      throw new NotFoundException(`Vendor with ID not found`);
    }
    return new VendorResponseDto(response);
  }

  async createVendor(
    createVendorDto: VendorDto | UpdateVendorDto,
    id: string | null,
  ): Promise<Vendor> {
    try {
      const updateVendor = id && (await this.getVendorById(id));
      const { email, items, ...vendorData } = createVendorDto;
      const existingVendor = await this.vendorRepository.findOne({
        where: { email, isArchived: false },
      });

      if (!updateVendor && existingVendor) {
        throw new NotFoundException('Email already exists');
      }

      const city = { id: vendorData.city };
      const country = { id: vendorData.country };
      const province = { id: vendorData.province };
      const area = { id: vendorData.area };
      const vendorCode = !id
        ? generateRandomNumber(6).toString()
        : updateVendor.vendorCode;

      const mappedVendorData: DeepPartial<Vendor> = {
        ...vendorData,
        city,
        country,
        province,
        area,
        vendorCode,
        email,
      };

      const vendor = updateVendor
        ? this.vendorRepository.merge(updateVendor, mappedVendorData)
        : this.vendorRepository.create(mappedVendorData);
      if (id) {
        this.vendorItemRepository.delete({ vendor: { id: id } });
      }

      vendor.items = [];
      for (const { itemId, price } of items) {
        const item = await this.itemRepository.findOne({
          where: { id: itemId },
        });
        if (item) {
          const vendorItem = new VendorItem();
          vendorItem.vendor = vendor;
          vendorItem.item = item;
          vendorItem.price = price;
          await this.vendorItemRepository.save(vendorItem);
          vendor.items.push(vendorItem);
        }
      }
      return await this.vendorRepository.save(vendor);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getList(query: QueryDto, pagination: PaginationDto): Promise<any> {
    const {
      name,
      type,
      address,
      vendorCode,
      country,
      city,
      area,
      email,
      mobile,
      province,
      search,
    } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const queryBuilder = this.vendorRepository
      .createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('vendor.country', 'country')
      .leftJoinAndSelect('vendor.province', 'province')
      .leftJoinAndSelect('vendor.city', 'city')
      .leftJoinAndSelect('vendor.area', 'area')
      .where('vendor.isArchived = :isArchived', { isArchived: false })
      .orderBy('vendor.createDateTime', 'DESC');

    // Applying filters
    if (name) {
      queryBuilder.andWhere('vendor.name ILIKE :name', { name: `%${name}%` });
    }
    if (type) {
      queryBuilder.andWhere('vendor.vendorType = :type', { type });
    }
    if (address) {
      queryBuilder.andWhere('vendor.address ILIKE :address', {
        address: `%${address}%`,
      });
    }
    if (email) {
      queryBuilder.andWhere('vendor.email ILIKE :email', {
        email: `%${email}%`,
      });
    }

    if (mobile) {
      queryBuilder.andWhere('vendor.mobile ILIKE :mobile', {
        mobile: `%${mobile}%`,
      });
    }
    if (vendorCode) {
      queryBuilder.andWhere('vendor.vendorCode ILIKE :vendorCode', {
        vendorCode: `%${vendorCode}%`,
      });
    }

    if (country) {
      queryBuilder.andWhere('country.id = :country', { country });
    }
    if (city) {
      queryBuilder.andWhere('city.id = :city', { city });
    }
    if (area) {
      queryBuilder.andWhere('area.id = :area', { area });
    }
    if (province) {
      queryBuilder.andWhere('province.id = :province', { province });
    }

    if (search && vendorSearchFields.length > 0) {
      const whereConditions = vendorSearchFields
        .map((field) => {
          if (field === 'vendorType') {
            return `vendor.${field}::text ILIKE :search`;
          } else if (field === 'area') {
            return `area.name ILIKE CAST(:search AS text)`;
          } else if (field === 'city') {
            return `city.name ILIKE CAST(:search AS text)`;
          } else if (field === 'province') {
            return `province.name ILIKE CAST(:search AS text)`;
          } else if (field === 'country') {
            return `country.name ILIKE CAST(:search AS text)`;
          } else {
            return `vendor.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }

    const totalRows = await queryBuilder.getCount();
    // Applying pagination
    const response = await queryBuilder.skip(skip).take(limit).getMany();
    const list = response.map((entity) => new VendorResponseDto(entity));
    return { totalRows, list };
  }

  async deleteVendor(id: string): Promise<any> {
    const vendor = await this.getVendorById(id);

    if (vendor) {
      vendor.isArchived = true;
      await this.vendorRepository.save(vendor);
    }

    return vendor;
  }
}
