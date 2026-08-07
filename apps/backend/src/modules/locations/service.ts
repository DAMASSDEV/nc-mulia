export interface LocationScheduleInput {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  sortOrder?: number;
}

export interface LocationInput {
  name: string;
  description?: string | null;
  placeId?: string | null;
  address: string;
  city: string;
  province?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: Record<string, { open: string; close: string; closed: boolean }> | null;
  isPrimary?: boolean;
  isActive?: boolean;
  sortOrder?: number | null;
  schedules?: LocationScheduleInput[] | null;
}

export interface LocationRecord {
  id: string;
  name: string;
  description: string | null;
  placeId: string | null;
  address: string;
  city: string;
  province: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  mapsUrl: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: Record<string, { open: string; close: string; closed: boolean }> | null;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
  schedules: Array<{ id: string; day: string; openTime: string; closeTime: string; isClosed: boolean; sortOrder: number }>;
  createdAt: string;
  updatedAt: string;
}

const defaultSchedules = [
  { id: 's1', day: 'Senin', openTime: '08:00', closeTime: '17:00', isClosed: false, sortOrder: 0 },
  { id: 's2', day: 'Selasa', openTime: '08:00', closeTime: '17:00', isClosed: false, sortOrder: 1 },
  { id: 's3', day: 'Rabu', openTime: '08:00', closeTime: '17:00', isClosed: false, sortOrder: 2 },
  { id: 's4', day: 'Kamis', openTime: '08:00', closeTime: '17:00', isClosed: false, sortOrder: 3 },
  { id: 's5', day: 'Jumat', openTime: '08:00', closeTime: '17:00', isClosed: false, sortOrder: 4 },
  { id: 's6', day: 'Sabtu', openTime: '08:00', closeTime: '15:00', isClosed: false, sortOrder: 5 },
  { id: 's7', day: 'Minggu', openTime: '08:00', closeTime: '12:00', isClosed: true, sortOrder: 6 },
];

const initialLocations: LocationRecord[] = [
  {
    id: 'loc-1',
    name: 'Klinik NC MULIA Pusat Jakarta',
    description: 'Pusat konsultasi nutrisi dan distributor resmi Herbalife NC Mulia.',
    placeId: 'ChIJbU15rDnxaS4RScn95d_ZtwU',
    address: 'Jl. Kemang Raya No. 45, Bangka, Mampang Prapatan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    phone: '021-7198899',
    email: 'info@nc-mulia.com',
    whatsapp: '6285157279448',
    mapsUrl: 'https://maps.google.com/?q=-6.2625,106.8166',
    latitude: -6.2625,
    longitude: 106.8166,
    openingHours: null,
    isPrimary: true,
    isActive: true,
    sortOrder: 0,
    schedules: defaultSchedules,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let inMemoryLocations: LocationRecord[] = [...initialLocations];

export class LocationsService {
  async list(onlyActive = false): Promise<LocationRecord[]> {
    let locs = inMemoryLocations;
    if (onlyActive) {
      locs = locs.filter(l => l.isActive);
    }
    return locs.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  }

  async getById(id: string): Promise<LocationRecord | null> {
    return inMemoryLocations.find(l => l.id === id) ?? null;
  }

  async create(data: LocationInput): Promise<LocationRecord> {
    if (data.isPrimary) {
      inMemoryLocations.forEach(l => { l.isPrimary = false; });
    }
    const newLoc: LocationRecord = {
      id: `loc-${Date.now()}`,
      name: data.name,
      description: data.description ?? null,
      placeId: data.placeId ?? null,
      address: data.address,
      city: data.city,
      province: data.province ?? 'DKI Jakarta',
      phone: data.phone ?? null,
      email: data.email ?? null,
      whatsapp: data.whatsapp ?? null,
      mapsUrl: data.mapsUrl ?? '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      openingHours: data.openingHours ?? null,
      isPrimary: data.isPrimary ?? (inMemoryLocations.length === 0),
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? inMemoryLocations.length,
      schedules: (data.schedules ?? []).map((s, i) => ({
        id: `sched-${Date.now()}-${i}`,
        day: s.day,
        openTime: s.openTime,
        closeTime: s.closeTime,
        isClosed: s.isClosed,
        sortOrder: s.sortOrder ?? i,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryLocations.push(newLoc);
    return newLoc;
  }

  async update(id: string, data: Partial<LocationInput>): Promise<LocationRecord> {
    const idx = inMemoryLocations.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Lokasi tidak ditemukan.');

    if (data.isPrimary) {
      inMemoryLocations.forEach(l => { l.isPrimary = false; });
    }

    const current = inMemoryLocations[idx];
    const updated: LocationRecord = {
      ...current,
      name: data.name ?? current.name,
      description: data.description !== undefined ? (data.description || null) : current.description,
      address: data.address ?? current.address,
      city: data.city ?? current.city,
      province: data.province ?? current.province,
      phone: data.phone !== undefined ? (data.phone || null) : current.phone,
      email: data.email !== undefined ? (data.email || null) : current.email,
      whatsapp: data.whatsapp !== undefined ? (data.whatsapp || null) : current.whatsapp,
      mapsUrl: data.mapsUrl ?? current.mapsUrl,
      latitude: data.latitude !== undefined ? data.latitude : current.latitude,
      longitude: data.longitude !== undefined ? data.longitude : current.longitude,
      isPrimary: data.isPrimary !== undefined ? data.isPrimary : current.isPrimary,
      isActive: data.isActive !== undefined ? data.isActive : current.isActive,
      schedules: data.schedules
        ? data.schedules.map((s, i) => ({
            id: `sched-${Date.now()}-${i}`,
            day: s.day,
            openTime: s.openTime,
            closeTime: s.closeTime,
            isClosed: s.isClosed,
            sortOrder: s.sortOrder ?? i,
          }))
        : current.schedules,
      updatedAt: new Date().toISOString(),
    };
    inMemoryLocations[idx] = updated;
    return updated;
  }

  async setPrimary(id: string): Promise<LocationRecord> {
    inMemoryLocations.forEach(l => { l.isPrimary = l.id === id; });
    const target = inMemoryLocations.find(l => l.id === id);
    if (!target) throw new Error('Lokasi tidak ditemukan.');
    return target;
  }

  async setActive(id: string, isActive: boolean): Promise<LocationRecord> {
    const target = inMemoryLocations.find(l => l.id === id);
    if (!target) throw new Error('Lokasi tidak ditemukan.');
    target.isActive = isActive;
    return target;
  }

  async remove(id: string): Promise<void> {
    inMemoryLocations = inMemoryLocations.filter(l => l.id !== id);
  }
}
