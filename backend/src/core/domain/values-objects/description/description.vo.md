### 📘 Funções da Classe DescriptionVO
### ✅ private constructor(value: string)
Construtor privado usado internamente para garantir que todas as instâncias passem pelas validações do método create.

### ✅ static create(rawValue: string, lang: 'pt' | 'en' = 'en', options: DescriptionValidationOptions)
Método de fábrica que cria uma instância validada de DescriptionVO.

Faz validações como:

Obrigatoriedade (required)

Tamanho mínimo (minLength)

Tamanho máximo (maxLength)

Usa mensagens localizadas com base no idioma (lang).

### ✅ getValue(): string
Retorna o valor encapsulado da descrição como string.

### ✅ toString(): string
Retorna o valor como string, útil para logs, outputs automáticos e concatenação.
