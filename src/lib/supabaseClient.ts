import { createClient } from '@supabase/supabase-js';

// Provide a fully type-safe mock layer or live database connection based on environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-space-database.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-1029384756-space-builder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Robust local storage fallback key definitions
const LOCAL_STORAGE_KEY_SYSTEMS = 'cosmobuilder_star_systems';
const LOCAL_STORAGE_KEY_STATIONS = 'cosmobuilder_stations';

export interface PlanetConfig {
  id: string;
  name: string;
  type: 'earth' | 'gas_giant' | 'lava' | 'ice' | 'exotic';
  color: string;
  size: number;
  distance: number;
  speed: number;
  hasRings: boolean;
  ringsColor?: string;
  rotationSpeed: number;
  moonsCount: number;
  mass: number; // in Earth masses
  atmosphere: string;
}

export interface StationModule {
  id: string;
  type: 'core' | 'solar' | 'habitat' | 'docking' | 'thruster';
  x: number;
  y: number;
  z: number;
  rotation: number;
}

export interface StarSystem {
  id: string;
  name: string;
  starType: 'yellow_dwarf' | 'blue_giant' | 'red_dwarf' | 'neutron';
  starColor: string;
  starSize: number;
  gravityFactor: number;
  planets: PlanetConfig[];
  createdAt: string;
}

export interface SpaceStationAssembly {
  id: string;
  name: string;
  modules: StationModule[];
  createdAt: string;
}

// Local storage system helper implementations to guarantee functionality even without external Supabase keys configured!
export const dbHelper = {
  async saveStarSystem(system: StarSystem): Promise<boolean> {
    try {
      // Try saving to Supabase if configured & dynamic keys are custom, otherwise fallback gracefully
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase.from('star_systems').upsert(system);
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
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase.from('space_stations').upsert(station);
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
