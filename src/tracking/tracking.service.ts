import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracking } from 'src/entities/tracking.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateTrackingDto } from './dto/create-dto';
import { TrackingActionType, TrackingType } from 'src/utils/constant';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
  ) {}

  async create(createTrackingDto: CreateTrackingDto): Promise<any> {
    const mappedrequest: DeepPartial<Tracking> = {
      ...createTrackingDto,
      mir: { id: createTrackingDto.mirId },
      mrr: { id: createTrackingDto.mrrId },
      grn: { id: createTrackingDto.grnId },
      user: { id: createTrackingDto.userId },
      action: createTrackingDto.action as TrackingActionType,
      type: createTrackingDto.type as TrackingType,
    };
    const tracking = this.trackingRepository.create(mappedrequest);
    return this.trackingRepository.save(tracking);
  }

  async trackingList(id: string) {
    const list = await this.trackingRepository
      .createQueryBuilder('tracking')
      .leftJoin('tracking.mir', 'mir')
      .leftJoin('tracking.mrr', 'mrr')
      .leftJoin('tracking.grn', 'grn')
      .leftJoin('tracking.user', 'user')
      .where('tracking.isArchived = :isArchived', { isArchived: false })
      .andWhere('(mir.id = :id OR mrr.id = :id OR grn.id = :id)', { id })
      .orderBy('tracking.createDateTime', 'DESC')
      .getMany();

    const isReviewData = list.find(
      (entity) => entity.action === TrackingActionType.USER_CREATED,
    );

    return { list, isReview: isReviewData?.isReview };
  }
}
