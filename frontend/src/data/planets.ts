export interface PlanetData {
  name: string;
  color: string;
  emissive?: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  distanceFromSunKm: number;
  tilt?: number;
}

export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    color: "#a6a6a6",
    radius: 0.2,
    orbitRadius: 3.2,
    orbitSpeed: 0.38,
    orbitOffset: 0.8,
    distanceFromSunKm: 57_900_000,
  },
  {
    name: "Venus",
    color: "#e8cda0",
    emissive: "#4a3a20",
    radius: 0.35,
    orbitRadius: 4.8,
    orbitSpeed: 0.28,
    orbitOffset: 2.1,
    distanceFromSunKm: 108_200_000,
  },
  {
    name: "Earth",
    color: "#4a7ab5",
    emissive: "#1a2a3a",
    radius: 0.38,
    orbitRadius: 6.6,
    orbitSpeed: 0.2,
    orbitOffset: 4.2,
    distanceFromSunKm: 149_600_000,
  },
  {
    name: "Mars",
    color: "#c4634a",
    emissive: "#3a1a10",
    radius: 0.28,
    orbitRadius: 8.8,
    orbitSpeed: 0.15,
    orbitOffset: 1.5,
    distanceFromSunKm: 227_900_000,
  },
  {
    name: "Jupiter",
    color: "#c9a96e",
    emissive: "#3a2a1a",
    radius: 0.9,
    orbitRadius: 12.5,
    orbitSpeed: 0.08,
    orbitOffset: 3.7,
    distanceFromSunKm: 778_600_000,
  },
  {
    name: "Saturn",
    color: "#d4c49a",
    emissive: "#3a3020",
    radius: 0.78,
    orbitRadius: 16.0,
    orbitSpeed: 0.055,
    orbitOffset: 5.1,
    distanceFromSunKm: 1_433_500_000,
  },
  {
    name: "Uranus",
    color: "#7ec8c8",
    emissive: "#1a3030",
    radius: 0.52,
    orbitRadius: 19.5,
    orbitSpeed: 0.035,
    orbitOffset: 0.3,
    distanceFromSunKm: 2_872_500_000,
    tilt: 1.4,
  },
  {
    name: "Neptune",
    color: "#4466aa",
    emissive: "#101830",
    radius: 0.48,
    orbitRadius: 23.0,
    orbitSpeed: 0.025,
    orbitOffset: 4.8,
    distanceFromSunKm: 4_495_100_000,
  },
];

// Walking speed in km/h — the foundation of all serious calculations
export const WALKING_SPEED_KMH = 5;

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatDistance(km: number): string {
  if (km >= 1_000_000_000) {
    return `${(km / 1_000_000_000).toFixed(1)}B km`;
  }
  if (km >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(1)}M km`;
  }
  return `${formatNumber(Math.round(km))} km`;
}

export function walkingTimeYears(distanceKm: number): number {
  const hours = distanceKm / WALKING_SPEED_KMH;
  const years = hours / (24 * 365.25);
  return years;
}

export function formatWalkingTime(distanceKm: number): string {
  const years = walkingTimeYears(distanceKm);
  if (years < 1) {
    const days = Math.round(years * 365.25);
    return `${formatNumber(days)} days`;
  }
  return `${formatNumber(Math.round(years))} years`;
}
