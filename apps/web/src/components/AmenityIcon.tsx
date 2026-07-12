/**
 * AmenityIcon — centralizes all amenity icons using Lucide SVGs.
 * Same pattern as CategoryIcon — single source of truth.
 * No emojis. Fallback to a generic check icon for unknown slugs.
 */

import {
  Wifi, ChefHat, Car, Wind, Flame, WashingMachine, Tv, Waves,
  Dumbbell, Trees, BedDouble, ArrowUp, PawPrint, Laptop,
  Thermometer, Snowflake, Coffee, Mountain, Umbrella, Star,
  CircleCheck,
} from 'lucide-react'

// Explicit interface — does not rely on LucideProps to avoid version-specific issues
interface AmenityIconProps {
  slug: string
  className?: string
  strokeWidth?: number | string
  size?: number | string
  color?: string
  style?: React.CSSProperties
}

type IconComponent = React.ComponentType<{
  className?: string
  strokeWidth?: number | string
  size?: number | string
  color?: string
  style?: React.CSSProperties
}>

const AMENITY_ICONS: Record<string, IconComponent> = {
  wifi: Wifi,
  kitchen: ChefHat,
  cocina: ChefHat,
  parking: Car,
  parqueadero: Car,
  ac: Snowflake,
  'aire-acondicionado': Snowflake,
  heating: Thermometer,
  calefaccion: Thermometer,
  washer: WashingMachine,
  lavadora: WashingMachine,
  tv: Tv,
  pool: Waves,
  piscina: Waves,
  gym: Dumbbell,
  gimnasio: Dumbbell,
  garden: Trees,
  jardin: Trees,
  balcony: Mountain,
  balcon: Mountain,
  elevator: ArrowUp,
  ascensor: ArrowUp,
  pets: PawPrint,
  mascotas: PawPrint,
  workspace: Laptop,
  escritorio: Laptop,
  bbq: Flame,
  chimenea: Flame,
  'beach-access': Umbrella,
  playa: Umbrella,
  coffee: Coffee,
  'tour-cafetero': Coffee,
  beds: BedDouble,
  camas: BedDouble,
  'mountain-view': Mountain,
  montana: Mountain,
  premium: Star,
  wind: Wind,
}

export default function AmenityIcon({ slug, ...props }: AmenityIconProps) {
  const normalizedSlug = slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')

  const Icon = AMENITY_ICONS[normalizedSlug] || CircleCheck

  return <Icon {...props} />
}
