### 💡 Exemplo de uso
- Aqui estão dois exemplos de uso, um para quilômetros (padrão) e outro para metros:
- 1. Distância em quilômetros (valor padrão):
```
const pointA = GeoLocation.create(-23.5505, -46.6333); // São Paulo
const pointB = GeoLocation.create(40.7128, -74.0060); // Nova York

const distanciaKm = pointA.distanceTo(pointB); // Por padrão, usa 'km'
console.log(`Distância entre São Paulo e Nova York: ${distanciaKm.toFixed(2)} km`);

```

- 2. Distância em metros:

```
const distanciaMetros = pointA.distanceTo(pointB, 'm');
console.log(`Distância entre São Paulo e Nova York: ${distanciaMetros.toFixed(2)} metros`);

```

### Exemplo de saída:

- 1. Em quilômetros:
```
Distância entre São Paulo e Nova York: 7982.93 km
```

- 2. Em metros::
```
Distância entre São Paulo e Nova York: 7982933.42 metros

import { Latitude } from './Latitude';
import { Longitude } from './Longitude';

const lat = new Latitude(-6.69746);
const lng = new Longitude(-35.53824);

console.log(`Latitude: ${lat.value}, Longitude: ${lng.value}`);

const pointA = LocationVO.create(-6.69815, -35.53834) // GGPizaria
const pointB = LocationVO.create(-6.69746, -35.53824) // Elenita

const distanciaKm = pointA.distanceTo(pointB) // Por padrão, usa 'km'
console.log(`Distância entre GGPizaria e Elenita: ${distanciaKm.toFixed(2)} km`)

const distanciaMetros = pointA.distanceTo(pointB, 'm')
console.log(
`Distância entre GGPizaria e Elenita: ${distanciaMetros.toFixed(2)} metros`,
)
```