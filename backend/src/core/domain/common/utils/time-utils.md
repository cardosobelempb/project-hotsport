# 🧪 Exemplos rápidos:
```ts
// ========================
// 1️⃣ Validação de horário
// ========================
console.log(TimeUtils.isValidTime('23:45')) // true
console.log(TimeUtils.isValidTime('24:00')) // false

// ========================
// 2️⃣ Formatar hora de uma Date
// ========================
const now = new Date()
console.log(TimeUtils.formatTime(now)) // exemplo: "14:30"

// ========================
// 3️⃣ Converter string para Date
// ========================
const dateFromString = TimeUtils.parseTime('08:15')
console.log(dateFromString) // Date com hora 08:15

// ========================
// 4️⃣ Adicionar ou subtrair minutos
// ========================
const newTime = TimeUtils.addMinutes(new Date('2025-11-15T10:00:00'), 90)
console.log(TimeUtils.formatTime(newTime)) // "11:30"

const earlierTime = TimeUtils.subtractMinutes(new Date('2025-11-15T10:00:00'), 15)
console.log(TimeUtils.formatTime(earlierTime)) // "09:45"

// ========================
// 5️⃣ Comparar horários
// ========================
console.log(TimeUtils.isSameTime('12:30', '12:30')) // true
console.log(TimeUtils.isSameTime('12:30', '12:31')) // false

// ========================
// 6️⃣ Diferença em minutos
// ========================
const diff = TimeUtils.diffInMinutes(
  new Date('2025-11-15T08:00:00'),
  new Date('2025-11-15T09:30:00')
)
console.log(diff) // 90

// ========================
// 7️⃣ Formatar hora em fuso horário
// ========================
console.log(TimeUtils.formatTimeInTimeZone(new Date(), 'America/Sao_Paulo'))

// ========================
// 8️⃣ Verificar se horário está entre dois horários
// ========================
const time = new Date('2025-11-15T10:30:00')
const start = new Date('2025-11-15T09:00:00')
const end = new Date('2025-11-15T11:00:00')
console.log(TimeUtils.isTimeBetween(time, start, end)) // true

// ========================
// 9️⃣ Converter minutos para formato legível
// ========================
console.log(TimeUtils.convertMinutesToReadable(150)) // "2h 30m"
console.log(TimeUtils.convertMinutesToReadable(45))  // "45m"
console.log(TimeUtils.convertMinutesToReadable(0))   // "0m"


```
