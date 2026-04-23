# 📘 Exemplos de Uso – NumberUtils:
## 🎯 1. formatNumberWithDecimal:
- Formata sempre com 2 casas decimais.

```ts
NumberUtils.formatNumberWithDecimal(123.4)
// "123.40"

NumberUtils.formatNumberWithDecimal(50)
// "50.00"

NumberUtils.formatNumberWithDecimal(NaN)
// "0.00" (protegido pelo ensureNumber)

```

## 🎯 2. formatCurrency
- Formata moeda usando Intl.NumberFormat.

Arredonda um número para o número especificado de casas decimais.
Exemplo: 2.345 com 2 casas decimais → 2.35.

```ts
NumberUtils.formatCurrency(1234.56)
// "R$ 1.234,56"

NumberUtils.formatCurrency(89.5, "en-US", "USD")
// "$89.50"

NumberUtils.formatCurrency(5000, "ja-JP", "JPY")
// "￥5,000"


```

## 🎯 3. parseCurrency
- Converte string de moeda → número.

Converte uma string de moeda (ex: "R$ 1.234,56") de volta para um número.
Exemplo: "R$ 1.234,56" → 1234.56.

```ts
NumberUtils.parseCurrency("R$ 1.234,56")
// 1234.56

NumberUtils.parseCurrency("€ 9.999,00")
// 9999

NumberUtils.parseCurrency("50,25")
// 50.25

NumberUtils.parseCurrency("texto inválido")
// 0


```

## 🎯 4. roundToDecimalPlaces
- Arredonda com precisão definida.

Formata um número como percentual (multiplicando o número por 100 e adicionando %).
Exemplo: 0.1234 → "12.34%".

```ts
NumberUtils.roundToDecimalPlaces(2.345, 2)
// 2.35

NumberUtils.roundToDecimalPlaces(10.5678, 3)
// 10.568

NumberUtils.roundToDecimalPlaces(5.1, 0)
// 5

```

## 🎯 5. formatPercentage
- Converte número → percentual.

Formata um número de telefone no formato (XX) XXXXX-XXXX (Brasil).
Exemplo: 1234567890 → (12) 34567-8901.

```ts
NumberUtils.formatPercentage(0.1234)
// "12.34%"

NumberUtils.formatPercentage(1)
// "100.00%"

NumberUtils.formatPercentage(-0.05)
// "-5.00%"

```

## 🎯 6. calculateTax
- Calcula imposto sobre um valor.

Calcula o valor do imposto sobre um valor (ex: 100 com 15% → 15).
Exemplo: 100 com 15% → 15.

```ts
NumberUtils.calculateTax(100, 15)
// 15

NumberUtils.calculateTax(250, 7.5)
// 18.75

NumberUtils.calculateTax(10_000, 27.5)
// 2750

```

## 🎯 7. isPositive / isNegative / isInteger

Verifica se um número é positivo.
Exemplo: 2 → true, -2 → false.

```ts
NumberUtils.isPositive(10)
// true

NumberUtils.isNegative(-5)
// true

NumberUtils.isInteger(10)
// true

NumberUtils.isInteger(10.5)
// false

NumberUtils.isPositive(NaN)
// false (ensureNumber → 0)


```

## 🎯 8. formatPhoneNumber
- Formata telefone brasileiro.

Verifica se um número é negativo.
Exemplo: -2 → true, 2 → false.

```ts
NumberUtils.formatPhoneNumber("11987654321")
// "(11) 98765-4321"

NumberUtils.formatPhoneNumber("11 98765-4321")
// "(11) 98765-4321"

NumberUtils.formatPhoneNumber("(11)987654321")
// "(11) 98765-4321"

NumberUtils.formatPhoneNumber("123")
// "123" (não formata pois não bate o padrão)


```

## 🔥 Exemplos Combinados (casos reais)
- 💰 Sistema de vendas — exibindo preço + imposto

```ts
const price = 129.9
const tax = NumberUtils.calculateTax(price, 12)
const finalPrice = price + tax

console.log("Preço:", NumberUtils.formatCurrency(price))
console.log("Imposto:", NumberUtils.formatCurrency(tax))
console.log("Total:", NumberUtils.formatCurrency(finalPrice))

Preço: R$ 129,90
Imposto: R$ 15,59
Total: R$ 145,49

```

## 📱 Formatação de telefone vindo de input desformatado

```ts
const input = "11-98765 4321"
const phoneFormatted = NumberUtils.formatPhoneNumber(input)

console.log(phoneFormatted)
// "(11) 98765-4321"

```

## 🧮 Arredondamento e porcentagem para gráficos

```ts
const value = 0.078998

const percent = NumberUtils.formatPercentage(
  NumberUtils.roundToDecimalPlaces(value, 4)
)

console.log(percent)
// "7.90%"

```

## 💹 Converter moeda do usuário para número e somar

```ts
const a = NumberUtils.parseCurrency("R$ 1.500,00")
const b = NumberUtils.parseCurrency("750,25")

console.log(a + b)
// 2250.25


```
