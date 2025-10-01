# Sistema de Banners - Portal do Cliente

## Visão Geral

O sistema de banners permite exibir anúncios, promoções e novidades no dashboard do portal do cliente de forma dinâmica e personalizada.

## Componentes

### 1. BannerCard
Componente individual para cada banner com:
- Título, subtítulo e descrição
- Ícone ou imagem de fundo
- Badge opcional
- Botão de ação com link
- Opção de fechar (dismissible)

### 2. BannersSection
Seção que agrupa múltiplos banners com:
- Título da seção
- Grid responsivo
- Opção de expandir/recolher
- Gerenciamento de banners visíveis

## Estrutura de Dados

```javascript
const banner = {
  id: 'banner-1',                    // ID único
  title: 'Título do Banner',         // Título principal
  subtitle: 'Subtítulo',             // Subtítulo opcional
  description: 'Descrição...',       // Descrição opcional
  icon: 'solar:icon-name',           // Ícone (se não usar imagem)
  image: 'url-da-imagem',            // Imagem de fundo (opcional)
  color: '#1976d2',                  // Cor primária
  colorSecondary: '#42a5f5',         // Cor secundária
  badge: 'NOVO',                     // Badge opcional
  badgeColor: '#4caf50',             // Cor do badge
  buttonText: 'Saiba Mais',          // Texto do botão
  buttonColor: '#1976d2',            // Cor do botão
  link: '/portal-cliente/servico',   // Link de destino
  dismissible: true,                 // Pode ser fechado
};
```

## Personalização por Usuário

A função `getBannersForUser(user)` permite personalizar banners baseados em:

### Perfil do Usuário
- **Role**: Usuários premium veem banners diferentes
- **Plano**: Usuários do plano Start veem banners de upgrade
- **Status**: Usuários novos veem banner de boas-vindas

### Contexto Temporal
- **Sazonal**: Banners de Natal, Black Friday, etc.
- **Promocional**: Ofertas especiais por período

## Exemplos de Uso

### Banner de Serviço
```javascript
{
  id: 'banner-servico',
  title: 'Novo Serviço: Consultoria Tributária',
  subtitle: 'Especialistas em impostos',
  description: 'Nossa equipe está pronta para otimizar sua carga tributária.',
  icon: 'solar:chart-2-bold',
  color: '#1976d2',
  badge: 'NOVO',
  buttonText: 'Solicitar Consultoria',
  link: '/portal-cliente/servicos/consultoria',
  dismissible: true,
}
```

### Banner de Upgrade
```javascript
{
  id: 'banner-upgrade',
  title: 'Upgrade para Pleno',
  subtitle: 'Desbloqueie mais funcionalidades',
  description: 'Acesse relatórios avançados e suporte prioritário.',
  icon: 'solar:rocket-bold',
  color: '#ff9800',
  badge: 'UPGRADE',
  buttonText: 'Fazer Upgrade',
  link: '/portal-cliente/financeiro',
  dismissible: true,
}
```

### Banner Promocional
```javascript
{
  id: 'banner-promocao',
  title: 'Promoção de Natal',
  subtitle: 'Desconto especial até 31/12',
  description: 'Aproveite nossa promoção de fim de ano.',
  icon: 'solar:gift-bold',
  color: '#d32f2f',
  badge: 'NATAL',
  buttonText: 'Ver Promoções',
  link: '/portal-cliente/promocoes',
  dismissible: true,
}
```

## Integração no Dashboard

```javascript
// No componente do dashboard
import { BannersSection } from 'src/components/banner/banners-section';
import { getBannersForUser } from 'src/data/banners';

const [banners, setBanners] = useState([]);

useEffect(() => {
  if (user) {
    const userBanners = getBannersForUser(user);
    setBanners(userBanners);
  }
}, [user]);

// No JSX
<BannersSection banners={banners} />
```

## Funcionalidades

### Interatividade
- **Clique**: Redireciona para o link especificado
- **Fechar**: Remove o banner da visualização
- **Expandir/Recolher**: Mostra/oculta a seção

### Responsividade
- **Desktop**: 3 banners por linha
- **Tablet**: 2 banners por linha
- **Mobile**: 1 banner por linha

### Acessibilidade
- Suporte a navegação por teclado
- Textos alternativos para imagens
- Contraste adequado de cores

## Customização

### Cores
- Use as cores do tema Material-UI
- Mantenha consistência visual
- Considere acessibilidade

### Ícones
- Use ícones do Iconify
- Prefira ícones da família "solar" ou "eva"
- Mantenha tamanho consistente (64px para fundo)

### Links
- Links internos: `/portal-cliente/pagina`
- Links externos: `https://exemplo.com`
- Links externos abrem em nova aba

## Manutenção

### Adicionar Novo Banner
1. Adicione o banner em `src/data/banners.js`
2. Configure a lógica de exibição em `getBannersForUser()`
3. Teste com diferentes perfis de usuário

### Remover Banner
1. Remova ou comente o banner em `sampleBanners`
2. Atualize a lógica de filtro se necessário

### Modificar Banner Existente
1. Edite o objeto do banner em `sampleBanners`
2. Teste as mudanças

## Boas Práticas

1. **Mantenha banners relevantes**: Evite spam
2. **Use textos claros**: Títulos e descrições objetivas
3. **Teste responsividade**: Verifique em diferentes telas
4. **Considere performance**: Não exagere no número de banners
5. **Monitore engajamento**: Acompanhe cliques e fechamentos
