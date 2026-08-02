import { prisma } from '../../lib/db.js';

export interface LocationScheduleInput {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  sortOrder?: number;
}

export interface LocationInput {
  name: string;
  description?: string;
  placeId?: string;
  address: string;
  city: string;
  province?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  mapsUrl: string;
  latitude?: number;
  longitude?: number;
  openingHours?: Record<string, { open: string; close: string; closed: boolean }>;
  isPrimary?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  schedules?: LocationScheduleInput[];
}

export class LocationsService {
  async list(onlyActive = false) {
    const locations = await prisma.location.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      include: { schedules: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return locations.map(l => ({
      ...l,
      schedules: l.schedules.map(s => ({
        ...s,
        openTime: s.openTime,
        closeTime: s.closeTime,
      })),
    }));
  }

  async getById(id: string) {
    return prisma.location.findUnique({
      where: { id },
      include: { schedules: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async create(data: LocationInput) {
    const { schedules, ...locData } = data;

    // If this location is primary, unset any existing primary
    if (locData.isPrimary) {
      await prisma.location.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const location = await prisma.location.create({
      data: {
        ...locData,
        schedules: schedules
          ? {
              create: schedules.map((s, i) => ({
                day: s.day,
                openTime: s.openTime,
                closeTime: s.closeTime,
                isClosed: s.isClosed,
                sortOrder: s.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: { schedules: { orderBy: { sortOrder: 'asc' } } },
    });
    return location;
  }

  async update(id: string, data: Partial<LocationInput>) {
    const { schedules, ...locData } = data;

    // If setting this as primary, unset any existing primary first
    if (locData.isPrimary) {
      await prisma.location.updateMany({
        where: { isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    if (schedules) {
      await prisma.locationSchedule.deleteMany({ where: { locationId: id } });
    }
    return prisma.location.update({
      where: { id },
      data: {
        ...locData,
        schedules: schedules
          ? {
              create: schedules.map((s, i) => ({
                day: s.day,
                openTime: s.openTime,
                closeTime: s.closeTime,
                isClosed: s.isClosed,
                sortOrder: s.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: { schedules: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async setPrimary(id: string) {
    await prisma.location.updateMany({ where: { isPrimary: true }, data: { isPrimary: false } });
    return prisma.location.update({ where: { id }, data: { isPrimary: true } });
  }

  async setActive(id: string, isActive: boolean) {
    return prisma.location.update({ where: { id }, data: { isActive } });
  }

  async remove(id: string) {
    await prisma.location.delete({ where: { id } });
  }
}
