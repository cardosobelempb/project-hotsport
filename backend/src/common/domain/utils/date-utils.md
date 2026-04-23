✅ 1. Durações legíveis
Ex: convertMsToReadable(90061000) → "1d 1h 1m 1s"

✅ 2. Verificação de intervalo (isBetween)
Ex: isBetween(data, inicio, fim)

✅ 3. Conversão para texto amigável
Ex: getRelativeTimeFromNow(new Date()) → "agora mesmo", "há 5 minutos", "em 3 dias"

# 🧪 Exemplos de Uso:

```ts

DateUtils.formatDate(new Date()) // "15/11/2025"

DateUtils.parseDate("10/01/2024") // Date

DateUtils.addDays(new Date(), 7)

DateUtils.isPast(new Date("2020-01-01"))

DateUtils.parseDate("10/01/2024") // ✔️ Date
DateUtils.parseDate("10/aa/2024") // ❌ null
DateUtils.parseDate("") // ❌ null
DateUtils.parseDate("32/01/2024") // ❌ null

DateUtils.getRelativeTimeFromNow(new Date(Date.now() + 60000))
// "em 1 minuto"


// Gera um calendário de Abril/2025
const calendar = DateUtils.generateMonthlyCalendar(2025, 3);
console.log(calendar);

// Verifica se 21 de abril de 2025 é feriado
console.log(DateUtils.isHoliday(new Date('2025-04-21'))); // true (Tiradentes)

// Pega 3 semanas a partir de hoje
console.log(DateUtils.generateWeeks(new Date(), 3));

```
