### 📘 Breve Descrição das Funções

## constructor
Cria e valida um novo número de telefone após limpar e aplicar regras.

## validate
Verifica se o telefone tem comprimento válido conforme configurado.

## getValue
Retorna o número limpo (somente dígitos).

## equals
Compara dois objetos PhoneVO pelo valor.

## format
Retorna o telefone formatado: (DDD) XXXX-XXXX ou (DDD) XXXXX-XXXX.

## isValid
Verifica se o número é válido: tamanho, DDD, e prefixo conforme regras.

## clean
Remove todos os caracteres não numéricos da string.

# ✅ Agora, veja a diferença na prática:

- ✔️ 1. Valor válido

```bash
const phone = PhoneVO.create('(11) 91234-5678')
console.log(phone.getValue()) // '11912345678'
```

-❌ 2. Valor undefined
```bash
const input: string | undefined = undefined
PhoneVO.create(input) // lança BadRequestError: "Telefone é obrigatório."
```

- ❌ 3. Valor vazio
```bash
PhoneVO.create('   ') // lança BadRequestError: "Telefone é obrigatório."
```

❌ 4. Valor inválido
```bash
PhoneVO.create('(00) 91234-5678') // DDD inválido: 00
```

✔️ 5. Checagem segura com isValid
```bash
PhoneVO.isValid(undefined) // false
PhoneVO.isValid('(11) 91234-5678') // true
```
