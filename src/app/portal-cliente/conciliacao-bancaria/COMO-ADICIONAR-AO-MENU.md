# 🔧 Como Adicionar Conciliação Bancária ao Menu

Guia passo a passo para adicionar a **Conciliação Bancária** ao menu de navegação do Portal do Cliente.

---

## 📍 Arquivo a Editar

```
src/layouts/cliente/config-navigation.jsx
```

---

## ✏️ Passo 1: Adicionar ao Menu

Edite o arquivo `config-navigation.jsx` e adicione a nova opção. Você tem **duas opções**:

### Opção A: Como Item Principal (Recomendado)

Adicione como um item principal do menu, no mesmo nível de "Dashboard", "Minha Empresa", etc.

**Localização**: Depois de "Meu Faturamento" (linha ~75)

```javascript
{
  title: 'Meu Faturamento',
  path: paths.cliente.faturamentos.root,
  icon: <Iconify icon="solar:hand-money-linear" />,
},
{
  title: 'Conciliação Bancária', // ✨ ADICIONAR AQUI
  path: paths.cliente.conciliacaoBancaria,
  icon: <Iconify icon="solar:card-transfer-bold-duotone" />,
},
{
  title: 'Meu Plano',
  path: paths.cliente.financeiro.root,
  icon: <Iconify icon="solar:money-bag-bold" />,
},
```

### Opção B: Dentro de "Meus Documentos"

Adicione como submenu dentro de "Meus Documentos".

**Localização**: Dentro do array `children` de "Meus Documentos" (linha ~84-95)

```javascript
{
  title: 'Meus Documentos',
  path: '#',
  icon: <Iconify icon="solar:documents-bold-duotone" />,
  children: [
    {
      title: 'Licenças',
      path: paths.cliente.licencas,
      icon: <Iconify icon="solar:document-text-bold-duotone" />,
    },
    {
      title: 'Societário',
      path: paths.cliente.societario.documentos, 
      icon: <Iconify icon="solar:folder-with-files-bold-duotone" />,
    },
    {
      title: 'Conciliação Bancária', // ✨ ADICIONAR AQUI
      path: paths.cliente.conciliacaoBancaria,
      icon: <Iconify icon="solar:card-transfer-bold-duotone" />,
    },
  ],
},
```

---

## 🎨 Ícones Sugeridos

Escolha um ícone que represente bem a funcionalidade:

```javascript
// Opção 1: Transferência/Cartão
icon: <Iconify icon="solar:card-transfer-bold-duotone" />

// Opção 2: Banco/Dinheiro
icon: <Iconify icon="solar:card-search-bold-duotone" />

// Opção 3: Conta bancária
icon: <Iconify icon="solar:wallet-money-bold-duotone" />

// Opção 4: Documentos financeiros
icon: <Iconify icon="solar:bill-check-bold-duotone" />

// Opção 5: Transações
icon: <Iconify icon="solar:bill-list-bold-duotone" />
```

---

## ✅ Código Completo Recomendado

Aqui está o código completo com a adição sugerida:

```javascript
import { paths } from 'src/routes/paths';

import { useSettings } from 'src/hooks/useSettings';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function usePortalNavData() {
  const { podeGerenciarClientes, podeGerenciarServicos, podeCriarOrcamentos } = useSettings();

  const vendasChildren = [
    podeGerenciarClientes && {
      title: 'Clientes',
      path: paths.cliente.clientes,
      icon: <Iconify icon="solar:users-group-two-rounded-bold-duotone" />,
    },
    podeGerenciarServicos && {
      title: 'Serviços',
      path: paths.cliente.servicos,
      icon: <Iconify icon="eos-icons:service" />,
    },
    podeCriarOrcamentos && {
      title: 'Vendas',
      path: paths.cliente.orcamentos.root,
      icon: <Iconify icon="solar:money-bag-bold" />,
    },
  ].filter(Boolean); 

  const items = [
    {
      title: 'Dashboard',
      path: paths.cliente.dashboard,
      icon: <Iconify icon="solar:home-2-bold-duotone" />,
    },
    {
      title: 'Importante',
      path: paths.cliente.conteudos.root,
      icon: <Iconify icon="solar:bookmark-bold-duotone" />,
      info: 'Novo',
      children: [
        {
          title: 'Aulão Reforma',
          path: paths.cliente.conteudos.aulaoReforma,
          icon: <Iconify icon="solar:play-circle-bold-duotone" />,
        },
        {
          title: 'Guia IRPF 2026',
          path: paths.cliente.conteudos.guiaIRPF2026,
          icon: <Iconify icon="solar:pie-chart-2-bold-duotone" />,
        },
        {
          title: 'Reforma Tributária',
          path: paths.cliente.conteudos.reformaTributaria,
          icon: <Iconify icon="solar:diagram-up-bold-duotone" />,
        },
      ],
    },
    {
      title: 'Minha Empresa',
      path: paths.cliente.empresa,
      icon: <Iconify icon="solar:buildings-2-bold-duotone" />,
    },
    vendasChildren.length > 0 && {
      title: 'Minhas Vendas',
      path: '#',
      icon: <Iconify icon="solar:bill-list-bold-duotone" />,
      children: vendasChildren,
    },
    {
      title: 'Meu Faturamento',
      path: paths.cliente.faturamentos.root,
      icon: <Iconify icon="solar:hand-money-linear" />,
    },
    // ✨ NOVO - Conciliação Bancária
    {
      title: 'Conciliação Bancária',
      path: paths.cliente.conciliacaoBancaria,
      icon: <Iconify icon="solar:card-transfer-bold-duotone" />,
      info: 'Novo', // Badge opcional
    },
    {
      title: 'Meu Plano',
      path: paths.cliente.financeiro.root,
      icon: <Iconify icon="solar:money-bag-bold" />,
    },
    {
      title: 'Meus Documentos',
      path: '#',
      icon: <Iconify icon="solar:documents-bold-duotone" />,
      children: [
        {
          title: 'Licenças',
          path: paths.cliente.licencas,
          icon: <Iconify icon="solar:document-text-bold-duotone" />,
        },
        {
          title: 'Societário',
          path: paths.cliente.societario.documentos, 
          icon: <Iconify icon="solar:folder-with-files-bold-duotone" />,
        },
      ],
    },
    {
      title: 'Configurações',
      path: paths.cliente.settings,
      icon: <Iconify icon="solar:settings-bold-duotone" />,
    },
  ].filter(Boolean);

  return [
    {
      subheader: 'Principal',
      items,
    },
  ];
}
```

---

## 🎯 Opções Adicionais

### Adicionar Badge "Novo"

Para destacar a nova funcionalidade:

```javascript
{
  title: 'Conciliação Bancária',
  path: paths.cliente.conciliacaoBancaria,
  icon: <Iconify icon="solar:card-transfer-bold-duotone" />,
  info: 'Novo', // Badge "Novo" aparecerá
}
```

### Adicionar Descrição (Tooltip)

Se o menu suportar tooltips:

```javascript
{
  title: 'Conciliação Bancária',
  path: paths.cliente.conciliacaoBancaria,
  icon: <Iconify icon="solar:card-transfer-bold-duotone" />,
  caption: 'Importe e concilie extratos bancários', // Descrição opcional
}
```

### Controle por Permissão

Se quiser mostrar apenas para alguns clientes:

```javascript
// No topo, adicionar à desestruturação
const { podeGerenciarClientes, podeGerenciarServicos, podeCriarOrcamentos, podeConciliarBanco } = useSettings();

// No array de items
podeConciliarBanco && {
  title: 'Conciliação Bancária',
  path: paths.cliente.conciliacaoBancaria,
  icon: <Iconify icon="solar:card-transfer-bold-duotone" />,
},
```

---

## 🧪 Testando

Após adicionar ao menu:

1. **Salve o arquivo**
2. **Aguarde o hot reload** (dev) ou **rebuilde** (prod)
3. **Acesse o portal do cliente**
4. **Faça login** como cliente
5. **Verifique** se o item aparece no menu
6. **Clique** no item para testar a navegação

---

## ✅ Checklist

- [ ] Arquivo `config-navigation.jsx` editado
- [ ] Ícone escolhido e adicionado
- [ ] Código salvo sem erros de sintaxe
- [ ] Servidor reiniciado (se necessário)
- [ ] Menu aparece no portal
- [ ] Link navega corretamente
- [ ] Página carrega sem erros
- [ ] Funcionalidade testada

---

## 🐛 Troubleshooting

### Menu não aparece

1. **Verifique a sintaxe** - Confira vírgulas, chaves, parênteses
2. **Limpe o cache** - `rm -rf .next` e rebuild
3. **Reinicie o servidor** - `npm run dev` ou `yarn dev`
4. **Verifique o console** - Procure por erros

### Link não funciona

1. **Confirme a rota** - Verifique `paths.cliente.conciliacaoBancaria`
2. **Teste a URL direta** - Acesse `/portal-cliente/conciliacao-bancaria`
3. **Verifique o arquivo** - Confirme que `page.jsx` existe

### Ícone não aparece

1. **Verifique o nome** - Confirme em [Iconify](https://icon-sets.iconify.design/solar/)
2. **Teste outro ícone** - Use um ícone mais simples para testar
3. **Verifique importação** - `Iconify` deve estar importado

---

## 📸 Preview Esperado

Após adicionar, o menu ficará assim:

```
Portal do Cliente
├── Dashboard
├── Importante
│   ├── Aulão Reforma
│   ├── Guia IRPF 2026
│   └── Reforma Tributária
├── Minha Empresa
├── Minhas Vendas (se houver permissão)
├── Meu Faturamento
├── Conciliação Bancária ✨ NOVO
├── Meu Plano
├── Meus Documentos
│   ├── Licenças
│   └── Societário
└── Configurações
```

---

## 📞 Suporte

Se tiver dúvidas:
1. Consulte a documentação do projeto
2. Verifique exemplos de outros itens do menu
3. Entre em contato com a equipe de desenvolvimento

---

**Pronto! Agora seu menu está atualizado com a nova funcionalidade!** 🎉
