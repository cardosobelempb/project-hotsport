### ✅ Melhorias aplicadas
1. Separação da normalização e validação → ajuda na testabilidade e reutilização.

2. Fallback consistente de mensagens com defaultMessages.

3. Validação de sobrenome adicionada (caso deseje garantir nomes compostos).

4. Tipo I18nContext opcional simplificado (sem precisar do mock direto no código).

5 .Tipagem mais clara e nome de métodos mais expressivos.

| Método/Função          | Descrição                                                            |
| ---------------------- | -------------------------------------------------------------------- |
| `constructor(...)`     | Inicializa o `NameVO`, normaliza e valida o nome com suporte a i18n. |
| `getValue()`           | Retorna o nome armazenado.                                           |
| `equals(other)`        | Compara com outro `NameVO`.                                          |
| `normalize(name)`      | Remove espaços extras e padroniza o nome.                            |
| `assertIsValid(...)`   | Valida comprimento, conteúdo e formato do nome.                      |
| `defaultMessages(...)` | Gera mensagens padrão caso `i18n` não seja fornecido.                |


### ✅ 5. Usando com NameVO

```
import { i18next } from '../i18n'
import { I18nContext } from './i18n-context/i18n-context'

// ...

const name = new NameVO('João Silva', {}, { t: i18next.t.bind(i18next) })

```

### ✅ 6. Exemplo de Teste com i18next

```
import { NameVO } from '../domain/NameVO'
import { i18next } from '../i18n'
import { BadRequestError } from '../../errors'

const i18nContext = {
  t: i18next.t.bind(i18next)
}

describe('NameVO with i18next', () => {
  it('should return translated error in PT when name is empty', () => {
    expect(() => new NameVO('', {}, i18nContext)).toThrow('O nome não pode estar vazio.')
  })

  it('should return translated error in PT when name is too short', () => {
    expect(() => new NameVO('J S', { minLength: 5 }, i18nContext))
      .toThrow('O nome deve ter pelo menos 5 caracteres.')
  })
})

```
