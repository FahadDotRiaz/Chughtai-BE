// gate-pass.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import { GatePass } from '../entities/gatePass.entity';
import { InwardOutward } from 'src/utils/constant';
import { convertTZ, generateRandomNumber } from 'src/utils/helper';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { gatePassSearchFields } from 'src/utils/searchColumn';

@Injectable()
export class GatePassService {
  constructor(
    @InjectRepository(GatePass)
    private readonly gatePassRepository: Repository<GatePass>,
  ) {}

  async createGatePass(
    createGatePassDto: CreateGatePassDto,
  ): Promise<GatePass> {
    const po = { id: createGatePassDto.po };
    const mappedRequestDto: DeepPartial<GatePass> = {
      ...createGatePassDto,
      po,
    };
    const gatePass = this.gatePassRepository.create(mappedRequestDto);

    if (createGatePassDto.inwardOutward === InwardOutward.Inward) {
      gatePass.IgpCode = generateRandomNumber(4);
    }
    if (createGatePassDto.inwardOutward === InwardOutward.Outward) {
      gatePass.OgpCode = generateRandomNumber(4);
    }
    return this.gatePassRepository.save(gatePass);
  }

  async getAllGatePasses(
    type: InwardOutward,
    query: QueryDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const {
      gpType,
      vendorName,
      driverName,
      itemUnit,
      IgpCode,
      OgpCode,
      vendorId,
      createDateTime,
      poCode,
      date,
      startTime,
      endTime,
      search,
    } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const gatePassQueryBuilder = this.gatePassRepository
      .createQueryBuilder('gate_pass')
      .leftJoinAndSelect('gate_pass.po', 'po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .where('gate_pass.isArchived = :isArchived', { isArchived: false })
      .andWhere('gate_pass.inwardOutward = :inwardOutward', {
        inwardOutward: type,
      })
      .orderBy('gate_pass.createDateTime', 'DESC');

    // Applying filters
    if (gpType) {
      gatePassQueryBuilder.andWhere('gate_pass.type = :gpType', {
        gpType,
      });
    }
    if (vendorName) {
      gatePassQueryBuilder.andWhere('vendor.name ILIKE :vendorName', {
        vendorName: `%${vendorName}%`,
      });
    }
    if (vendorId) {
      gatePassQueryBuilder.andWhere('vendor.id = :vendorId', {
        vendorId,
      });
    }
    if (driverName) {
      gatePassQueryBuilder.andWhere('gate_pass.driverName ILIKE :driverName', {
        driverName: `%${driverName}%`,
      });
    }
    if (itemUnit) {
      gatePassQueryBuilder.andWhere('gate_pass.itemUnit = :itemUnit', {
        itemUnit,
      });
    }
    if (poCode) {
      gatePassQueryBuilder.andWhere('po.poCode ILIKE :poCode', {
        poCode: `%${poCode}%`,
      });
    }
    if (createDateTime) {
      const createDateTimeFormatted = `${createDateTime}T00:00:00.000Z`;
      gatePassQueryBuilder.andWhere(
        `DATE(gate_pass.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }
    if (date) {
      const dateFormatted = `${date}T00:00:00.000Z`;
      gatePassQueryBuilder.andWhere(`DATE(gate_pass.date) = DATE(:date)`, {
        date: dateFormatted,
      });
    }
    if (OgpCode) {
      gatePassQueryBuilder.andWhere('gate_pass.OgpCode = :OgpCode', {
        OgpCode,
      });
    }
    if (IgpCode) {
      gatePassQueryBuilder.andWhere('gate_pass.IgpCode = :IgpCode', {
        IgpCode,
      });
    }

    if (search && gatePassSearchFields.length > 0) {
      const whereConditions = gatePassSearchFields
        .map((field) => {
          if (field === 'type') {
            return `gate_pass.${field}::text ILIKE :search`;
          } else {
            return `gate_pass.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      gatePassQueryBuilder.andWhere(`(${whereConditions})`, {
        search: `%${search}%`,
      });
    }
    const totalRows = await gatePassQueryBuilder.getCount();
    const list = await gatePassQueryBuilder
      .skip(skip)
      .take(limit ?? 10)
      .select(['gate_pass', 'po.id', 'po.poCode', 'vendor.id', 'vendor.name'])
      .getMany()
      .then((results) => {
        results.forEach((result) => {
          result.date = result.date && convertTZ(result.date);
        });
        if (startTime || endTime) {
          results = results?.filter((result) => {
            const resultTime = result?.date?.toString().split(' ')[1];
            return (
              (!startTime || resultTime >= startTime) &&
              (!endTime || resultTime <= endTime)
            );
          });
        }

        return results;
      })
      .catch((error) => {
        throw error;
      });

    return { totalRows, list };
  }

  async getGatePassById(id: string): Promise<GatePass> {
    const gatePass = await this.gatePassRepository
      .createQueryBuilder('gate_pass')
      .leftJoinAndSelect('gate_pass.po', 'po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .where('gate_pass.isArchived = :isArchived', { isArchived: false })
      .andWhere('gate_pass.id = :id', {
        id: id,
      })
      .orderBy('gate_pass.createDateTime', 'DESC')
      .select(['gate_pass', 'po.id', 'po.poCode', 'vendor.id', 'vendor.name'])
      .getOne();
    return gatePass;
  }

  async updateGatePass(
    id: string,
    updateData: DeepPartial<GatePass>,
  ): Promise<any> {
    const gatePass = await this.getGatePassById(id);
    const po = { id: updateData.po };
    const data: any = {
      ...updateData,
      po,
    };
    this.gatePassRepository.merge(gatePass, data);
    return this.gatePassRepository.save(gatePass);
  }

  async deleteGatePass(id: string): Promise<any> {
    const gatePass = await this.getGatePassById(id);

    if (gatePass) {
      gatePass.isArchived = true;
      await this.gatePassRepository.save(gatePass);
    }

    return gatePass;
  }
}
