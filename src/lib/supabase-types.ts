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
  mass: number;
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
