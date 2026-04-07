import { LatitudeVO } from './latitude.vo'
import { LongitudeVO } from './longitude.vo'

export class LocationVO {
  private constructor(
    public readonly latitude: LatitudeVO,
    public readonly longitude: LongitudeVO,
  ) {}

  /** Factory para criar uma nova instância */
  public static create(
    latitude: LatitudeVO,
    longitude: LongitudeVO,
  ): LocationVO {
    return new LocationVO(latitude, longitude)
  }

  /** Compara se duas localizações são iguais */
  public equals(other: LocationVO): boolean {
    return (
      this.latitude.equals(other.latitude) &&
      this.longitude.equals(other.longitude)
    )
  }

  /** Calcula a distância entre dois pontos usando Haversine */
  public distanceTo(other: LocationVO, unit: 'km' | 'm' = 'km'): number {
    const R = unit === 'm' ? 6371000 : 6371 // Raio da Terra
    const toRadians = (deg: number) => (deg * Math.PI) / 180

    const dLat = toRadians(other.latitude.value - this.latitude.value)
    const dLon = toRadians(other.longitude.value - this.longitude.value)

    const lat1 = toRadians(this.latitude.value)
    const lat2 = toRadians(other.latitude.value)

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /** Representação em string */
  public toString(): string {
    return `(${this.latitude.value}, ${this.longitude.value})`
  }
}


/**
Exemplo de uso:
const loc1 = LocationVO.create(new LatitudeVO(40.7128), new LongitudeVO(-74.0060)) // NYC
const loc2 = LocationVO.create(new LatitudeVO(34.0522), new LongitudeVO(-118.2437)) // LA

console.log(loc1.distanceTo(loc2, 'km')) // ~3936 km
console.log(loc1.toString())             // "(40.7128, -74.006)"
console.log(loc1.equals(loc2))          // false

 */
