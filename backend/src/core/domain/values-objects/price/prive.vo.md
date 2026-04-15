### ✅ Breve Descrição das Funções

## create(input, options)
Valida, normaliza e cria um novo PriceVO a partir de string ou número.

## create(input, options)
Método fábrica que cria um PriceVO a partir de string ou number, validando a entrada.

## getValue()
Retorna o valor numérico bruto da instância (ex: 12.5).

## getCurrency()
Retorna o código da moeda (ex: USD, BRL).

## format(options)
Retorna o valor formatado como moeda (ex: R$ 12,50 ou $12.50) com base no idioma/moeda.

## toString()
Converte o valor para string formatada. Usa format() como padrão.

## isCurrencySupported()
Verifica se a moeda fornecida é suportada pelo Intl.NumberFormat.
