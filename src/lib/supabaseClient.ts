import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type {
  PlanetConfig,
  SpaceStationAssembly,
  StarSystem,
} from './supabase-types';

export type {
  PlanetConfig,
  SpaceStationAssembly,
  StarSystem,
  StationModule,
} from './supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createSharedSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
}

const sharedSupabaseClient: SupabaseClient | null = createSharedSupabaseClient();

export function requireSupabaseClient(): SupabaseClient {
  if (!sharedSupabaseClient) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return sharedSupabaseClient;
}

// Robust local storage fallback key definitions
const LOCAL_STORAGE_KEY_SYSTEMS = 'cosmobuilder_star_systems';
const LOCAL_STORAGE_KEY_STATIONS = 'cosmobuilder_stations';

// Local storage helper implementations keep the imported components usable until real Supabase values are added.
export const dbHelper = {
  async saveStarSystem(system: StarSystem): Promise<boolean> {
    try {
      if (sharedSupabaseClient) {
        const { error } = await sharedSupabaseClient.from('star_systems').upsert(system);
        if (!error) return true;
      }
      
      // Fallback/Local storage backup
      if (typeof window !== 'undefined') {
        const current = this.getStarSystems();
        const filtered = current.filter(s => s.id !== system.id);
        filtered.push(system);
        localStorage.setItem(LOCAL_STORAGE_KEY_SYSTEMS, JSON.stringify(filtered));
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Supabase not fully configured or localstorage error, using local storage fallback:', e);
      return false;
    }
  },

  getStarSystems(): StarSystem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_SYSTEMS);
    if (!data) {
      // Seed initial data
      const initial: StarSystem[] = [
        {
          id: 'solar-alpha',
          name: 'Kepler-452 Neon',
          starType: 'yellow_dwarf',
          starColor: '#ffd700',
          starSize: 6,
          gravityFactor: 1.0,
          createdAt: new Date().toISOString(),
          planets: [
            {
              id: 'p1',
              name: 'Ignis Prime',
              type: 'lava',
              color: '#ff3c00',
              size: 1.2,
              distance: 12,
              speed: 0.03,
              hasRings: false,
              rotationSpeed: 0.05,
              moonsCount: 0,
              mass: 0.8,
              atmosphere: 'Sulfur Dioxide'
            },
            {
              id: 'p2',
              name: 'Cypher Earth',
              type: 'earth',
              color: '#00f0ff',
              size: 2.1,
              distance: 22,
              speed: 0.015,
              hasRings: false,
              rotationSpeed: 0.02,
              moonsCount: 1,
              mass: 1.2,
              atmosphere: 'Nitrogen-Oxygen (Ozone Active)'
            },
            {
              id: 'p3',
              name: 'Gigantor Omega',
              type: 'gas_giant',
              color: '#bf55ec',
              size: 4.5,
              distance: 40,
              speed: 0.006,
              hasRings: true,
              ringsColor: '#bf55ec',
              rotationSpeed: 0.008,
              moonsCount: 4,
              mass: 310,
              atmosphere: 'Hydrogen-Helium Complex'
            },
            {
              id: 'p4',
              name: 'Boreas-9',
              type: 'ice',
              color: '#a2ded0',
              size: 1.6,
              distance: 55,
              speed: 0.003,
              hasRings: false,
              rotationSpeed: 0.01,
              moonsCount: 2,
              mass: 5.4,
              atmosphere: 'Frozen Methane'
            }
          ]
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY_SYSTEMS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  async saveSpaceStation(station: SpaceStationAssembly): Promise<boolean> {
    try {
      if (sharedSupabaseClient) {
        const { error } = await sharedSupabaseClient.from('space_stations').upsert(station);
        if (!error) return true;
      }
      if (typeof window !== 'undefined') {
        const current = this.getSpaceStations();
        const filtered = current.filter(s => s.id !== station.id);
        filtered.push(station);
        localStorage.setItem(LOCAL_STORAGE_KEY_STATIONS, JSON.stringify(filtered));
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Error saving station, using fallback:', e);
      return false;
    }
  },

  getSpaceStations(): SpaceStationAssembly[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_STATIONS);
    if (!data) {
      const initial: SpaceStationAssembly[] = [
        {
          id: 'station-omega',
          name: 'Vanguard DeepSpace IX',
          createdAt: new Date().toISOString(),
          modules: [
            { id: 'm1', type: 'core', x: 0, y: 0, z: 0, rotation: 0 },
            { id: 'm2', type: 'solar', x: 0, y: 0, z: 2.5, rotation: 0 },
            { id: 'm3', type: 'solar', x: 0, y: 0, z: -2.5, rotation: 180 },
            { id: 'm4', type: 'habitat', x: 2.5, y: 0, z: 0, rotation: 90 },
            { id: 'm5', type: 'docking', x: -2.5, y: 0, z: 0, rotation: 270 }
          ]
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY_STATIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }
};
