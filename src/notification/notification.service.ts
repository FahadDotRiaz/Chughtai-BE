import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { Notification } from 'src/entities/notification.entity';
import { UserService } from 'src/users/user.service';
import { In, Repository } from 'typeorm';
import { PaginationDto } from './dto/query.dto';
import { UserEntity } from 'src/entities/user.entity';
import * as firebase from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = path.join(
  process.cwd(),
  'chughtai-project-firebase-adminsdk.json',
);
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccountPath),
});
@Injectable()
export class NotificationService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private readonly user: UserService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    // admin.initializeApp({
    //   credential: admin.credential.cert({
    //     projectId: this.configService.get<any>('PROJECT_ID'),
    //     clientEmail: this.configService.get<any>('CLIENT_EMAIL'),
    //     privateKey: this.configService.get<any>('PRIVATE_KEY'),
    //   }),
    // });
  }

  async sendingNotificationToAllUsers(
    payload: any,
    departmentId: string,
    menuKey?: string,
  ) {
    try {
      const department = { id: departmentId };
      const notificationData = {
        payload,
        menuKey,
        department,
      };

      const users = await this.user.findUsersByMenuKey(menuKey, departmentId);
      if (!users) {
        throw new NotFoundException('User not found');
      }

      const notificationPromises = users?.map(async (user) => {
        const notification: admin.messaging.TokenMessage = {
          data: { message: payload.message, date: payload.date },
          token: user?.deviceToken,
          apns: {
            payload: {
              aps: {
                'content-available': 1,
              },
            },
          },
        };
        try {
          const response = await admin.messaging().send(notification);
          console.log(
            `Notification sent successfully to user ${user.id}:`,
            response,
          );
          return response;
        } catch (error) {
          console.error(
            `Error sending notification to user ${user.id}:`,
            error,
          );
        }
      });

      const result = await Promise.all(notificationPromises);

      const createNotification =
        await this.notificationRepository.create(notificationData);
      await this.notificationRepository.save(createNotification);

      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  }

  async getNotifications(userId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (Number(page ?? 1) - 1) * Number(limit ?? 10);
    const menu = [];
    const departmentIds = [];
    const userRoles = await this.userRepository.findOne({
      where: { isArchived: false, id: userId },
      relations: [
        'roles',
        'roles.actions',
        'roles.department',
        'roles.actions.menu',
      ],
    });

    for (const role of userRoles?.roles) {
      departmentIds.push(role.department.id);
      role.actions.forEach((action) => {
        menu.push(action?.menu?.menuKey);
      });
    }

    const notifications = [];

    for (const departmentId of [...new Set(departmentIds)]) {
      const [list, totalRows] = await Promise.all([
        this.notificationRepository.find({
          where: {
            isArchived: false,
            department: { id: departmentId },
            menuKey: In([...new Set(menu)]),
          },
          order: {
            createDateTime: 'DESC',
          },
        }),
        this.notificationRepository.count({
          where: {
            isArchived: false,
            department: { id: departmentId },
            menuKey: In([...new Set(menu)]),
          },
          order: {
            createDateTime: 'DESC',
          },
        }),
      ]);

      notifications.push({ list, totalRows });
    }

    const combinedList = notifications.flatMap(({ list }) => list);
    combinedList.sort((a, b) => (a.createDateTime < b.createDateTime ? 1 : -1));

    const totalRows = combinedList.length;
    const paginatedList = combinedList.slice(skip, skip + Number(limit));

    if (paginatedList.length === 0) {
      throw new NotFoundException('Notifications not found');
    }

    return {
      totalRows,
      list: paginatedList,
    };
  }
}
