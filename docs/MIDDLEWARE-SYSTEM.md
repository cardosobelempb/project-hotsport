# Sistema de Middleware

## Visão Geral

O sistema de middleware do Hotspot segue a padrão Express e é responsável por processar requisições HTTP antes de chegarem aos controllers. O middleware é organizado em camadas específicas para autenticação, resolução de tenant e autorização de roles.

## Estrutura de Diretórios

```
/backend/src/middleware/
├── auth.js              # Verificação de token JWT
├── tenant.js            # Resolução de empresa_id (multi-tenant)
└── authorize.js         # Verificação de permissões por role
```

## Fluxo de Processamento

Toda requisição protegida segue esta cadeia de middleware:

```
request 
  → auth.js (verifica JWT) 
  → tenant.js (resolve empresa_id) 
  → authorize(roles) (verifica permissões) 
  → controller
```

### 1. Middleware de Autenticação (`auth.js`)

**Localização:** `/backend/src/middleware/auth.js`

**Responsabilidades:**
- Verificar presença do token JWT no header `Authorization: Bearer <token>`
- Validar assinatura e expiração do token usando `JWT_SECRET`
- Extrair payload do token (contém `empresa_id`, `role`, `email`, `empresa_slug`)
- Anexar o payload decodificado ao objeto `request` como `request.admin`
- Retornar erro 401 se token inválido, expirado ou ausente

**Exemplo de Implementação:**
```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.admin = admin; // { empresa_id, role, email, empresa_slug }
    next();
  });
}

module.exports = { authenticateToken };
```

### 2. Middleware de Tenant (`tenant.js`)

**Localização:** `/backend/src/middleware/tenant.js`

**Responsabilidades:**
- Extrair `empresa_id` do payload JWT (disponível em `request.admin.empresa_id`)
- Permitir que super admins sobrescrevam o contexto usando header `x-empresa-id`
- Validar que a empresa existe e está ativa
- Anexar `empresa_id` ao objeto `request` para uso em queries e controllers
- Retornar erro 403 se empresa não encontrada ou inativa

**Exemplo de Implementação:**
```javascript
const { empresas } = require('../models'); // Assuming Sequelize models

async function resolveTenant(req, res, next) {
  let empresaId = req.admin?.empresa_id;

  // Super admin pode sobrescrever contexto via header
  if (req.admin?.role === 'super_admin' && req.headers['x-empresa-id']) {
    empresaId = parseInt(req.headers['x-empresa-id'], 10);
  }

  if (!empresaId) {
    return res.status(400).json({ error: 'Empresa não identificada' });
  }

  try {
    const empresa = await empresas.findByPk(empresaId);
    if (!empresa || !empresa.ativo) {
      return res.status(403).json({ error: 'Empresa inválida ou inativa' });
    }

    req.empresaId = empresaId;
    req.empresaSlug = empresa.slug;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao verificar empresa' });
  }
}

module.exports = { resolveTenant };
```

### 3. Middleware de Autorização (`authorize.js`)

**Localização:** `/backend/src/middleware/authorize.js`

**Responsabilidades:**
- Verificar se o papel (role) do usuário tem permissão para acessar a rota
- Aceitar uma lista de roles permitidas como parâmetro
- Retornar erro 403 se o usuário não tiver role adequado
- Suportar verificação de múltiplas roles (pelo menos uma deve corresponder)

**Exemplo de Implementação:**
```javascript
function authorize(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.admin?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Super admin tem acesso a tudo
    if (userRole === 'super_admin') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ 
      error: `Acesso negado. Role necessário: ${allowedRoles.join(', ')}` 
    });
  };
}

module.exports = { authorize };
```

## Uso nas Rotas

### Exemplo Básico (Acesso para qualquer role autenticada)
```javascript
const { authenticateToken, resolveTenant } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/dashboard', 
  authenticateToken, 
  resolveTenant, 
  authorize(['super_admin', 'owner', 'manager', 'operator']), 
  dashboardController.getStats
);
```

### Exemplo Restrito (Apenas owner e manager)
```javascript
router.put('/planos/:id', 
  authenticateToken, 
  resolveTenant, 
  authorize(['owner', 'manager']), 
  planosController.update
);
```

### Exemplo Super Admin Apenas
```javascript
router.delete('/empresas/:id', 
  authenticateToken, 
  resolveTenant, 
  authorize(['super_admin']), 
  empresasController.delete
);
```

## Middleware Customizado

Além dos middlewares core, o projeto utiliza middlewares especializados para funcionalidades específicas:

### Middleware de Limite de Taxa (Rate Limiting)
Utilizado em endpoints sensíveis como login e geração de pagamentos para prevenir abusos.

### Middleware de Validação de Input
Sanitiza e valida dados de entrada usando Zod ou Joi antes de chegar aos controllers.

### Middleware de Tratamento de Erros
Centraliza o tratamento de erros assíncronos e formata respostas de erro consistentes.

### Middleware de Logging
Registra informações de requisição (URL, method, IP, user agent, tempo de resposta) para auditoria e debugging.

## Boas Práticas

1. **Ordem Importante:** Sempre mantenha a ordem `auth → tenant → authorize` para garantir que:
   - Usuário está autenticado antes de tentar identificar empresa
   - Empresa é identificada antes de verificar permissões específicas da empresa
   - Permissões são verificadas apenas para usuários autenticados com empresa válida

2. **Tratamento de Erros:** Cada middleware deve retornar respostas HTTP apropriadas (401, 403, 400) em vez de passar erros para o next(), exceto em casos excepcionais.

3. **Performance:** Evite operações síncronas pesadas em middleware. Operações de banco de dados devem ser assíncronas e otimizadas.

4. **Segurança:** Nunca confie em dados do client sem validação, mesmo após autenticação. O middleware de tenant, por exemplo, verifica ativamente se a empresa existe e está ativa.

5. **Testabilidade:** Middlewares devem ser funções puras o máximo possível, facilitando testes unitários com mocks de request/response.

## Integração com Super Admin

O sistema foi projetado para acomodar super admins que gerenciam múltiplas empresas:

- Super admin autentica normalmente via JWT (contém sua empresa_id padrão)
- Pode sobrescrever o contexto usando header `x-empresa-id: <ID-da-empresa-alvo>`
- O middleware `tenant.js` respeita esse header apenas quando o role é `super_admin`
- Isso permite que um super admin acesse dados de qualquer empresa sem precisar fazer logout/login

**Exemplo de Requisição Super Admin:**
```
GET /api/empresas/5/planos
Headers:
  Authorization: Bearer <jwt-token-do-super-admin>
  x-empresa-id: 5
```

## Considerações de Multi-Tenant

Todo middleware que interage com o banco de dados deve garantir que as queries incluam filtro por `empresa_id`:

```javascript
// Correto - sempre filtrar por empresa_id
const planos = await planosModel.findAll({ 
  where: { empresa_id: req.empresaId } 
});

// Incorreto - vulnerável a vazamento de dados entre empresas
const planos = await planosModel.findAll();
```

O middleware `tenant.js` garante que `req.empresaId` esteja sempre disponível em rotas protegidas, tornando esse padrão consistente em todo o códigobase.

## Depuração e Diagnóstico

Para solucionar problemas de middleware:

1. Verifique se o token JWT está sendo enviado corretamente no header Authorization
2. Confirme que o JWT_SECRET no .env corresponde ao usado na geração do token
3. Verifique se a empresa_id no token é válida e a empresa está ativa
4. Para super admins, confirme que o header x-empresa-id está sendo enviado quando necessário
5. Logs intermediários podem ser adicionados temporariamente em cada middleware para rastrear onde a falha ocorre

## Conclusão

O sistema de middleware do Hotspot fornece uma base sólida e segura para handle de autenticação, multi-tenancy e autorização. Sua separação em responsabilidades claras (auth, tenant, authorize) facilita manutenção, teste e extensão. Seguir o padrão estabelecido garante consistência em toda a aplicação e reduz significativamente o risco de vulnerabilidades de segurança relacionadas a autenticação e acesso a dados.