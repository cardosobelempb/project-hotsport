### 📘 Exemplo de uso:

```
const checkIn = CheckInDate.create('2025-06-10');
const checkOut = CheckOutDate.create('2025-06-12', checkIn);

console.log(checkIn.isPast());        // depende da data atual
console.log(checkOut.format());       // 2025-06-12
console.log(checkOut.isAfter(checkIn)); // true

const today = CheckInVO.create(new Date());
const tomorrow = CheckInVO.create(new Date(Date.now() + 86400000)); // +1 dia

console.log('Hoje:', today.format());                 // 2025-06-06
console.log('Amanhã:', tomorrow.format());            // 2025-06-07
console.log('É igual?', today.isSame(tomorrow));      // false
console.log('Hoje é antes de amanhã?', today.isBefore(tomorrow)); // true

const start = '2025-06-05'
const end = '2025-06-10'

if (!CheckInVO.isTodayWithinRange(start, end)) {
  throw new Error('A data de hoje não está dentro do período permitido para check-in.')
}

const checkIn = CheckInVO.create('2025-06-05')

if (checkIn.isExpired()) {
  throw new Error('Não é possível realizar check-in para uma data passada.')
}


```