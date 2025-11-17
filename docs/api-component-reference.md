# Attualize HUB - Documentacao de APIs, Funcoes e Componentes

Este guia consolida tudo que e considerado "publico" no monorepo: endpoints http, funcoes utilitarias, hooks compartilhados e componentes reutilizaveis. O objetivo e permitir que novos times ou integradores encontrem rapidamente **o que existe**, **como importar** e **como usar** cada recurso.

> Todas as instrucoes e exemplos adotam React/Next 14, Material UI e SWR, que ja estao configurados no projeto.

---

## Como navegar

- **Secao 1** explicita configuracoes globais (env, axios, libs).
- **Secao 2** lista todos os endpoints contidos em `src/utils/axios.js`.
- **Secao 3** detalha cada arquivo em `src/actions/`.
- **Secao 4** cobre os hooks em `src/hooks/`.
- **Secao 5** mapeia utilitarios (`src/utils/`, `src/lib/`, `src/contexts/`).
- **Secao 6** reune componentes reutilizaveis (diretorio `src/components/`).
- **Secao 7** mostra fluxos combinando APIs + componentes + hooks.
- **Secao 8** traz boas praticas para extensao e testes.

---

## 1. Configuracao global

### 1.1 Objeto `CONFIG` (`src/config-global.js`)

| Campo | Descricao | Origem |
| --- | --- | --- |
| `site.serverUrl`, `assetURL`, `basePath` | URLs principais consumidas via `axios`. | `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_ASSET_URL`, `NEXT_PUBLIC_BASE_PATH` |
| `site.version` | Versao atual tomada do `package.json`. | build |
| `auth.method` | `jwt` por padrao (opcoes: jwt, amplify, firebase, supabase, auth0). | env / codigo |
| `auth.redirectPath` | Redirecionamento apos login. | `src/routes/paths` |
| `mapbox`, `firebase`, `amplify`, `auth0`, `supabase` | Credenciais opcionais para os respectivos provedores. | variaveis NEXT_PUBLIC_* |

### 1.2 Cliente HTTP (`src/utils/axios.js`)

- `axiosInstance`: baseia-se em `CONFIG.site.serverUrl`. Intercepta respostas e sempre rejeita com `error.response.data`.
- `fetcher`: helper para SWR. Aceita string ou `[url, config]`.
- `baseUrl`: alias para `process.env.NEXT_PUBLIC_API_URL`. Grande parte dos endpoints concatena esse valor.

### 1.3 Inicializacao de SDKs (`src/lib`)

| Arquivo | Quando e usado | Exporta |
| --- | --- | --- |
| `src/lib/firebase.js` | `CONFIG.auth.method === 'firebase'`. | `firebaseApp`, `AUTH`, `FIRESTORE`. |
| `src/lib/supabase.js` | `CONFIG.auth.method === 'supabase'`. | `supabase`. |

---

## 2. Endpoints HTTP (`endpoints` em `src/utils/axios.js`)

> Todos os caminhos abaixo assumem `baseUrl = process.env.NEXT_PUBLIC_API_URL`. Quando a propriedade for uma funcao, o parametro entre parenteses representa uma parte da rota.

### 2.1 Core e mock

| Chave | Metodo(s) tipicos | URL | Observacoes |
| --- | --- | --- | --- |
| `chat` | GET/PUT/POST | `/api/chat` | Usa mock local para contatos e conversas. |
| `kanban` | GET/POST | `${baseUrl}comercial/board` | Kanban comercial; aceita comandos via `params.endpoint`. |
| `calendar` | GET/POST/PUT/PATCH | `/api/calendar` | Mock local sincronizado via `mutate`. |

### 2.2 Auth

| Campo | Metodo | URL |
| --- | --- | --- |
| `auth.signIn` | POST | `${baseUrl}users/authenticate` |
| `auth.signUp` | POST | `/api/auth/sign-up` |
| `auth.resetPassword` | POST | `${baseUrl}users/reset-password` |
| `auth.updatePassword` | PUT | `${baseUrl}users/update-password` |

### 2.3 Conteudo (blog/produto)

| Chave | Metodos | URL |
| --- | --- | --- |
| `post.list` | GET | `/api/post/list` |
| `post.details` | GET | `/api/post/details` |
| `post.latest` | GET | `/api/post/latest` |
| `post.search` | GET | `/api/post/search` |
| `product.list` | GET | `/api/product/list` |
| `product.details` | GET | `/api/product/details` |
| `product.search` | GET | `/api/product/search` |

### 2.4 Clientes e CRM

| Dom | URL/Metodo | Observacoes |
| --- | --- | --- |
| `clientes.list` | GET `${baseUrl}/clientes` | Aceita filtros via query string. |
| `clientes.leads` | GET `${baseUrl}clientes/leads/all` | Liga com funil de leads. |
| `clientes.create` | POST `${baseUrl}financeiro/invoice/create` | Usado para onboarding rapido. |
| `clientes.update` | PUT `${baseUrl}clientes` | Concatene `/id`. |
| `clientes.historico` | GET `${baseUrl}clientes/historico` | Requer `/clienteId`. |
| `clientes.atualizarDados` | PUT `${baseUrl}clientes/atualizar-dados` | Atualizacoes massivas. |
| `clientes.servicos.admin` | GET `${baseUrl}clientes/servicos/admin/all` | Usado por `useServicosAdmin`. |

### 2.5 Financeiro

| Dom | URL base | Notas |
| --- | --- | --- |
| `invoices` | `${baseUrl}financeiro` | `invoices`, `invoice/create|update|delete`, `checkout/orcamento`. |
| `contasPagar` | `${baseUrl}financeiro/contas-*` | Inclui `criar`, `periodo`, `agendamentoInter`, `dashboard`. |
| `contratos` | `${baseUrl}contratos` | CRUD completo + cobrancas, boletos, assinatura Mercado Pago. |
| `marketing.financeiro` | `${baseUrl}marketing/dashboard-contas-*` | Dashboards receber/pagar. |

### 2.6 Fiscal/Notas

| Chave | URL |
| --- | --- |
| `fiscal.atividades` | `${baseUrl}fiscal/atividades` (list/create/update/delete) |
| `notas fiscais` | Vide `src/actions/notafiscal.js`, baseado em `${baseUrl}nota-fiscal/...` |

### 2.7 Portal do cliente

Todos os subcaminhos vivem sob `${baseUrl}portal`.

| Recurso | URL resolver | Operacoes |
| --- | --- | --- |
| Clientes | `portal.clientes.*` | `list(clienteProprietarioId)`, `get`, `create`, `update`, `delete`. |
| Servicos | `portal.servicos.*` | `list`, `categorias`, `get`, `create`, `update(id)`, `delete(id)`, `admin`. |
| Orcamentos | `portal.orcamentos.*` | `list`, `stats`, `get`, `create`, `update`, `updateStatus`, `delete`, `pdf`. |

### 2.8 Avaliacoes

| Propriedade | URL |
| --- | --- |
| `avaliacoes.root` | `${baseUrl}avaliacoes` |
| `avaliacoes.byId(id)` | `${baseUrl}avaliacoes/${id}` |
| `avaliacoes.estatisticas(clienteProprietarioId)` | `${baseUrl}avaliacoes/estatisticas/${clienteProprietarioId}` |
| `avaliacoes.tiposFeedback` | `${baseUrl}avaliacoes/tipos-feedback/lista` |
| `avaliacoes.responder(id)` | `${baseUrl}avaliacoes/${id}/responder` |
| `avaliacoes.status(id)` | `${baseUrl}avaliacoes/${id}/status` |
| `avaliacoes.delete(id)` | `${baseUrl}avaliacoes/${id}` |

### 2.9 Mercado Pago

Resumido em `endpoints.mercadoPago.*`, incluindo rotas para pagamento unico, parcelamento, assinaturas e consultas (`pagamento(pagamentoId)`, `pagamentosCliente(clienteId)`).

### 2.10 Settings / feature flags

- `settings.base`: `${baseUrl}settings`
- `settings.byClienteId(clienteId)`
- `settings.check(clienteId, funcionalidade)`

---

## 3. Camada de acoes (`src/actions`)

> Hooks baseados em SWR retornam sempre objetos memoizados com chaves `Loading`, `Error`, `Validating` e, quando aplicavel, flags `Empty`.

### 3.1 Blog e conteudo estatico

| Arquivo | API | Descricao |
| --- | --- | --- |
| `blog.js` | `useGetPosts`, `useGetPost(title)`, `useGetLatestPosts(title)`, `useSearchPosts(query)` | Consumem mock `/api/post/*`. |
| `blog-ssr.js` | `getPosts(page, perPage)`, `getPostBySlug(slug)`, `getLatestPosts(perPage)`, `searchPosts(query, page, perPage)` | Integram WordPress (`https://attualizecontabil.com.br/wp-json/wp/v2/posts`). |

Exemplo:

```jsx
import { useGetPosts } from 'src/actions/blog';

export function BlogList() {
  const { posts, postsLoading, postsEmpty } = useGetPosts();
  if (postsLoading) return 'Carregando...';
  if (postsEmpty) return 'Sem posts';
  return posts.map((post) => <article key={post.id}>{post.title}</article>);
}
```

### 3.2 Produtos

- `useGetProducts`, `useGetProduct(productId)`, `useSearchProducts(query)` (SWR).
- `getProducts()`, `getProduct(id)` (SSR friendly).

### 3.3 Clientes (`src/actions/clientes.js`)

| Funcao | Tipo | Uso |
| --- | --- | --- |
| `getClientes(params)` | async | Lista crua (promessa). |
| `useGetAllClientes(params?)` | hook | Concatena filtros padrao `status=true`, `tipoContato=cliente`. |
| `getClientesAndLeads`, `getClienteById` | async | Leitura detalhada. |
| `deleteCliente`, `updateCliente`, `criarCliente` | async | CRUD. |
| `historicoCliente`, `atualizarDadosCliente` | async | Historico e sincronizacao. |

Snippet:

```js
const { data, isLoading, mutate } = useGetAllClientes({ plano: 'start' });
await updateCliente(id, formData);
mutate(); // revalida
```

### 3.4 CEP

- `buscarCep(cep)` (`src/actions/cep.js`): consulta ViaCEP e retorna { rua, cidade, estado }.
- `consultarCep(cep)` (`src/utils/consultarCep.js`): variante com axios puro.

### 3.5 Certificados digitais

Funcoes em `src/actions/certificados.js`:

- Upload/download (`uploadCertificado`, `downloadCertificado`).
- CRUD e ativacao (`getCertificadosCliente`, `getCertificadoAtivo`, `desativarCertificado`, `listarCertificados`, `getSenhaCertificado`).
- Helpers (`validarArquivoCertificado`, `formatarDataCertificado`, `getCorStatusCertificado`, `getIconeStatusCertificado`).

Uso tipico:

```js
const { isValid, error } = validarArquivoCertificado(file);
if (!isValid) throw new Error(error);
await uploadCertificado(file, senha, clienteId);
```

### 3.6 Avaliacoes de clientes

Hooks SWR:

- `useAvaliacoes(params, { enabled })`
- `useAvaliacao(id)`
- `useAvaliacoesEstatisticas(clienteProprietarioId, feedback)`
- `useAvaliacoesTiposFeedback(clienteProprietarioId)`

Mutacoes autenticadas via `Cookies` + localStorage:

- `createAvaliacao`, `responderAvaliacao`, `atualizarStatusAvaliacao`, `deletarAvaliacao`.

### 3.7 Calendario

- `useGetEvents()`: sincroniza mock e expande `textColor`.
- `createEvent`, `updateEvent`, `deleteEvent`: usam apenas `mutate` local porque `enableServer` esta `false` por padrao. Ative para persistir no backend.

### 3.8 Chat

Hooks: `useGetContacts`, `useGetConversations`, `useGetConversation(conversationId)`.

Mutacoes: `sendMessage`, `createConversation`, `clickConversation`. Cada uma atualiza caches `conversation` e `conversations`.

### 3.9 Clientes > servicos admin

`useServicosAdmin(clienteId, filters)` e funcoes `getServicoAdminById`, `createServicoAdmin`, `updateServicoAdmin`, `deleteServicoAdmin`. Todos reutilizam rotas do portal, mas com escopo administrativo.

### 3.10 Contas a pagar (`src/actions/contas.js`)

Funcoes puras com axios:

- `criarContaPagar(data)`
- `buscarContasPagarPorMes(dataInicio, dataFim)` (POST)
- `buscarContasPagarPorPeriodo(dataInicio, dataFim)` (GET)
- `buscarContaPagarPorId(id)`
- `atualizarContaPagarPorId(id, data)`
- `deletarContaPagarPorId(id)`
- `registrarContaNoBancoInter(id)`
- `listarBancos()`
- `agendarPagamento(id, data)`

### 3.11 Financeiro / contratos (`src/actions/financeiro.js`)

Principais grupos:

- Contratos: `getContratos`, `getContratoPorId`, `postContrato`, `updateContrato`, `deletarContrato`, `getContratosPorMes`, `getContratosPorClienteID`.
- Cobrancas: `buscarCobrancasContratoId`, `atualizarCobrancaPorId`, `criarCobrancasPorContrato`, `deletarCobrancaPorId`, `getCobrancaPorId`, `gerarBoletoPorId`, `cancelarBoleto`, `enviarBoletoDigisac`.
- Relatorios: `getCobrancasPorData`, `getFaturaPorId`.
- Mercado Pago: `criarAssinaturaMercadoPago`.
- Helper financeiro: `calcularTotais(invoices)` retorna `{ pago, pendente, vencido }`.

### 3.12 Invoices (`src/actions/invoices.js`)

`getInvoices`, `getInvoiceById`, `deleteInvoiceById`, `createInvoice`, `updateInvoice`, `crirarPedidoOrcamento`, `enviarPedidoOrcamento`.

### 3.13 Kanban comercial

`useGetBoard()` + mutacoes `createColumn`, `updateColumn`, `moveColumn`, `clearColumn`, `deleteColumn`, `createTask`, `updateTask`, `moveTask`, `deleteTask`, `addCommentToTask`, `deleteCommentFromTask`. Todas suportam otimizacao local via `mutate`; ative `enableServer` para persistencia.

### 3.14 Leads e marketing (`src/actions/lead.js`)

| Categoria | Funcoes |
| --- | --- |
| CRUD basico | `criarLead`, `atualizarLead`, `getLeads`, `getLeadById` |
| Dashboards | `buscarDadosDashboard`, `buscarDashboardFinanceiroPagar`, `buscarDashboardFinanceiroReceber` |
| Stepper abertura CNPJ | `saveLeadProgress`, `createLead`, `updateLeadProgress` |
| Contatos | `addLeadContact`, `getLeadContacts`, `updateLeadStatus` |

Todas retornam objetos com `{ success, leadId, lead }` quando apropriado.

### 3.15 Mail (`src/actions/mail.js`)

- `useGetLabels()`
- `useGetMails(labelId)` -> `{ mails: { byId, allIds } }`
- `useGetMail(mailId)`

### 3.16 Mercado Pago (`src/actions/mercado-pago.js`)

Pagamentos unicos: `processarPagamentoUnico`, `consultarParcelamento`, `useParcelamento`.

Assinaturas: `criarAssinatura`, `consultarAssinatura`, `pausarAssinatura`, `reativarAssinatura`, `cancelarAssinatura`.

Consultas: `consultarPagamento`, `listarPagamentosCliente`, `usePagamentosCliente`.

### 3.17 Nota fiscal (`src/actions/notafiscal.js`)

- Invoice: `criarNFSeInvoice`, `cancelarNFSeInvoice`, `getNfsesByInvoice`.
- Orcamento portal: `criarNFSeOrcamento`, `getNfsesByOrcamento`.
- Listagem: `listarNotasFiscaisPorCliente`.
- Status: `cancelarNotaFiscal`.

### 3.18 ParceiroId (`src/actions/parceiroId.js`)

- `getAllCnaes()`: consulta catalogo publico.
- `openMEI(params)`: cria MEI via ParceiroId.

### 3.19 Portal do cliente (`src/actions/portal.js`)

Hooks SWR:

- `usePortalClientes(clienteProprietarioId, params)`
- `usePortalServicos(clienteProprietarioId, params)`
- `usePortalCategorias(clienteProprietarioId)`
- `usePortalOrcamentos(clienteProprietarioId, params)`
- `usePortalOrcamentosStats(clienteProprietarioId)`

APIs:

- Clientes: `portalGetCliente`, `portalCreateCliente`, `portalUpdateCliente`, `portalDeleteCliente`.
- Servicos: `portalCreateServico`, `portalUpdateServico`, `portalDeleteServico`, `portalGetServico`.
- Orcamentos: `portalGetOrcamento`, `portalCreateOrcamento`, `portalUpdateOrcamento`, `portalUpdateOrcamentoStatus`, `portalDeleteOrcamento`, `portalDownloadOrcamentoPDF`.

### 3.20 Produtos/servicos auxiliares

- `serviceItens.js`: `getServiceItens`, `getServiceItemById`, `createServiceItem`, `updateServiceItem`.
- `servicos-admin.js`: vide secao 3.9.

### 3.21 Settings (`src/actions/settings.js`)

- `useGetSettings(clienteId)` -> retorna `settings` e `refetchSettings`.
- `updateSettings(clienteId, payload)`.
- `useCheckFuncionalidade(clienteId, funcionalidade)` -> `{ funcionalidadeAtiva }`.

### 3.22 Societario

Dividido em blocos:

1. **Aberturas**: `getAberturasSocietario`, `getAberturaById`, `createAbertura`, `updateAbertura`, `solicitarAprovacaoPorId`, `enviarLinkAbertura`.
2. **Arquivos genericos**: `uploadArquivo`, `downloadArquivo`, `deletarArquivo`.
3. **Licencas**: `getLicencas`, `getLicencaById`, `createLicenca`, `updateLicencaWithFile`, `updateLicenca`, `deleteLicenca`, `downloadLicenca`, `deletarArquivoLicenca`.
4. **Comentarios de licenca**: `listarComentariosLicenca`, `criarComentarioLicenca`, `deletarComentarioSocietario`.
5. **Alteracoes societarias**: `getAlteracoesSocietario`, `createAlteracao`, `getAlteracaoById`, `sendMessageLink`, `updateAlteracao`, `uploadArquivoAlteracao`, `downloadArquivoAlteracao`, `deletarArquivoAlteracao`, `aprovarAlteracaoPorId`.

Cada funcao usa `FormData` quando necessario e sempre retorna a promessa do axios para permitir tratamento customizado.

### 3.23 Usuarios (`src/actions/users.js`)

`getUsersCliente`, `criarUserCliente`, `editarUserCliente`, `deletarUserCliente`, `updatePassword`, `forgotPassword`.

### 3.24 CEP e utilitarios externos

- `buscarCep` (fetch nativo) e `consultarCep` (axios) ja descritos.

---

## 4. Hooks compartilhados (`src/hooks`)

| Hook | Retorno | Observacoes |
| --- | --- | --- |
| `useBoolean(defaultValue)` | `{ value, onTrue, onFalse, onToggle, setValue }` | Controle booleans em dialogs e switches. |
| `useClientRect(ref?)` | Dimensoes + scroll de um elemento. | Usa `useEventListener` e `useLayoutEffect`. |
| `useCookies(key, initialState, defaultValues, options)` | `{ state, setState, setField, resetState, canReset }` | Persiste via document.cookie (JSON). |
| `useCopyToClipboard()` | `{ copy, copiedText }` | Wrapper do `navigator.clipboard`. |
| `useCountdownDate(date)` | `{ days, hours, minutes, seconds }`. | Atualiza a cada 1s. |
| `useCountdownSeconds(initCountdown)` | `{ counting, countdown, startCountdown, setCountdown }`. |
| `useDebounce(value, delay)` | Valor debounced. |
| `useDocumentos()` | `{ documentos, loading, refetchDocumentos }` | Busca documentos do cliente no portal. |
| `useDoubleClick({ click, doubleClick, timeout })` | Handler unico. |
| `useEmpresa(userId)` | `{ empresas, empresaAtiva, trocarEmpresa, temMultiplasEmpresas, loading* }`. |
| `useEventListener(event, handler, element?, options?)` | side-effect. |
| `useLicencas(user)` | `{ licencas, loading, pagination, filtroStatus, handleFiltroChange, handlePageChange }`. |
| `useLocalStorage(key, initialState)` | Mesmo shape de `useCookies`, mas usando `localStorage`. |
| `useResponsive(query, start, end)` | `boolean` | Abstrai `useMediaQuery`. |
| `useWidth()` | Breakpoint atual (`'xs' ... 'xl'`). |
| `useScrollOffSetTop(top)` | `{ elementRef, offsetTop }` | Usa `framer-motion`. |
| `useSetState(initial)` | `{ state, setState, setField, onResetState, canReset }`. |
| `useStatusProps(status)` | `{ label, color, icon }` pre pronto para status de cobranca. |
| `useTabs(defaultValue)` | `{ value, setValue, onChange }`. |
| `useSettings()` | Deriva bandeiras `podeEmitirNFSe`, etc, do `SettingsContext`. |

Uso tipico:

```jsx
const { value, onToggle } = useBoolean();
const { state, setField } = useLocalStorage('filters', { status: 'ativos' });
```

---

## 5. Utilitarios

### 5.1 Helpers (`src/utils/helper.js`)

- `flattenArray(list, key)`
- `flattenDeep(array)`
- `orderBy(array, properties, orders)`
- `keyBy(array, key)`
- `sumBy(array, iteratee)`
- `isEqual(a, b)`
- `merge(target, ...sources)`
- `getMonthName(monthIndex)`
- `toTitleCase(name)`

### 5.2 Formatadores

- `src/utils/format-number.js`: `fNumber`, `fCurrency` (BRL), `fPercent`, `fShortenNumber`, `fData`, `formatCpfCnpj`, `formatLargePercent`.
- `src/utils/format-time.js`: `formatStr` const e funcoes `today`, `fDateTime`, `fDate`, `fTime`, `fTimestamp`, `fToNow`, `fIsBetween`, `fIsAfter`, `fIsSame`, `fDateRangeShortLabel`, `fAdd`, `fSub`.
- `src/utils/formatter.js`: `formatCNAE`, `formatCodigoServico`, `formatCNPJ`.
- `src/utils/change-case.js`: `paramCase`, `snakeCase`, `sentenceCase`.
- `src/utils/uuidv4.js`: gera uuids v4 client-side.

### 5.3 Storage helpers

- `storage-available.js`: `localStorageAvailable`, `localStorageGetItem`.
- `with-loading-props.jsx`: HOC `withLoadingProps(loader)` que injeta um contexto com props carregadas dinamicamente.

### 5.4 Dados e constantes

- `constants/bancos.js`: lista completa de bancos brasileiros.
- `constants/categorias.js`: `categoriasReceitas`, `categoriasDespesas`, `getCategoriaNome`.
- `constants/table-utils.js`: `applySortFilter` com ordenacao estavel; auxilia `src/components/table`.
- `codigo-servico.json`: tabela de codigos de servico municipais (consumido por telas fiscais).

### 5.5 Hooks/contexts auxiliares

- `src/contexts/SettingsContext.jsx`: `SettingsProvider` + `useSettingsContext()` responsavel por armazenar `settings` e responder `isFuncionalidadeAtiva`.

---

## 6. Componentes reutilizaveis (`src/components`)

A lista abaixo considera apenas simbolos exportados via `index.js`. Se precisar de componentes especificos de um fluxo (por exemplo `components/abertura/ComponenteEmConstituicao`), importe diretamente do arquivo correspondente.

### 6.1 Animacao e efeitos (`src/components/animate`)

- Variantes Framer Motion (`varBounce`, `varFade`, `varSlide`, `varScale`, `varRotate`, `varPath`, `varContainer`, `varActions`, `varTransition`, `varBackground`).
- Containers: `MotionContainer`, `MotionViewport`, `AnimateText`, `AnimateLogo`, `AnimateAvatar`, `AnimateBorder`, `AnimateCountUp`.
- Utilitarios: `ScrollProgress`, `useScrollProgress`, `BackToTop`.

Exemplo:

```jsx
import { MotionViewport, varFade } from 'src/components/animate';

<MotionViewport>
  <Box component={m.div} variants={varFade().inUp}>
    Conteudo
  </Box>
</MotionViewport>
```

### 6.2 Navegacao

- **Nav Section (`src/components/nav-section`)**: variantes `Mini`, `Vertical`, `Horizontal` e hooks/styles para menus colapsados.
- **Nav Basic (`src/components/nav-basic`)**: versoes `Desktop`, `Mobile` e `Mini` para menus simples.
- **Mega Menu (`src/components/mega-menu`)**: `Horizontal`, `Vertical`, `Mobile`, alem de `classes` e `css-vars`.
- **Custom Breadcrumbs / Tabs / Popover / Dialog**: wrappers prontos com interface Material UI.

### 6.3 Formularios e entrada

- **Hook Form (`src/components/hook-form`)**: exposto em submodulos `fields`, `FormProvider`, `RHFTextField`, `RHFSelect`, `RHFCheckbox`, `RHFRadioGroup`, `RHFSwitch`, `RHFSlider`, `RHFDatePicker`, `RHFPhoneInput`, `RHFUpload`, `RHFEditor`, `RHFAutocomplete`, `RHFCountrySelect`, `RHFCode`.
- **Phone Input** (`src/components/phone-input`), **Country Select** (`src/components/country-select`), **CustomDateRangePicker** (`useDateRangePicker` + componente), **CustomTabs**.
- **Mercado Pago** (`MercadoPagoCheckoutDialog`, `MercadoPagoStatusScreenDialog`, `MercadoPagoProvider`) para fluxos de cobranca com `@mercadopago/sdk-react`.

Uso:

```jsx
import { FormProvider, RHFTextField, RHFSwitch } from 'src/components/hook-form';

<FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
  <RHFTextField name="nome" label="Nome completo" />
  <RHFSwitch name="ativo" label="Ativo" />
</FormProvider>
```

### 6.4 Visualizacao de dados

- **Table** (`src/components/table`): `useTable`, `TableHeadCustom`, `TablePaginationCustom`, `TableEmptyRows`, `TableSkeleton`, `TableNoData`, `TableSelectedAction`, `table/utils`.
- **Chart** (`src/components/chart`): `Chart`, `useChart`, `ChartSelect`, `ChartLegends`, `ChartLoading` (Recharts + Apex).
- **Carousel** (`src/components/carousel`): componentes `Carousel`, `CarouselSlide`, `CarouselThumbs`, `CarouselDotButtons`, `CarouselArrowButtons`, `CarouselProgressBar`, `useCarousel` hook e `breakpoints`.
- **ProgressBar** (`src/components/progress-bar`).
- **Animate Count Up** (vide secao 6.1) para valores numericos.

### 6.5 Mapa, geolocalizacao e organizacao

- `src/components/map`: `Map`, `MapMarker`, `MapPopup`, `MapControl` baseados em Mapbox GL.
- `src/components/organizational-chart`: organograma em arvore.
- `src/components/walktour`: onboarding com `react-joyride` (inclui `WalktourTooltip`, `WalktourProgressBar`, `useWalktour`).

### 6.6 Midia e assets

- **Image** (`Image`, `ImageSkeleton`, `ImageRatio`), **Lightbox** (`Lightbox`, `useLightBox`), **Upload** (drag-n-drop, avatar, preview single/multi).
- **FileThumbnail**: utilitarios para icones por tipo de arquivo.
- **Iconify**: `Iconify`, `IconifySocial`, `FlagIcon`, `classes`.
- **Logo**: `Logo`, `LogoText`.
- **SVG Color**: aplica tema em SVGs externos.

### 6.7 Feedback e estados

- **Loading Screen** (`SplashScreen`, `LoadingScreen`).
- **EmptyContent**, **FiltersResult**.
- **Snackbar** (`sonner` + wrapper `enqueueSnackbar`).
- **SearchNotFound`, `Label` (chip com variantes), `Divider` custom, `Paper`.
- **Banner**: `BannerCard`, `BannersSection` (vide `SISTEMA-BANNERS.md` para estrategias de dados).
- **Animate/Scroll progress** e `BackToTop`.

### 6.8 UX avancado

- **CustomPopover** (`usePopover`, `CustomPopover`).
- **CustomDialog** (`ConfirmDialog`).
- **Color utils** (`ColorPicker`, `ColorPreview`).
- **FilterResult** e `FiltersBlock` para exibicao de filtros aplicados.
- **Walktour** (vide 6.5).
- **Settings Drawer** (`SettingsDrawer`, `SettingsProvider`, `useSettingsContext`, `config-settings`).
- **Mega menu / nav** (citado anteriormente).
- **Scrollbar** (`Scrollbar`, classes) para wraps custom.
- **Phone Input** e `CountrySelect` (citado em formularios).

### 6.9 Mercado Pago UI

- `MercadoPagoCheckoutDialog`: integra Card Payment Brick com fallback e logs.
- `MercadoPagoStatusScreenDialog`: exibe status aprovado/pending/rejected.
- `MercadoPagoProvider`: injeta chaves publicas `@mercadopago/sdk-react`.

Snippet:

```jsx
<MercadoPagoProvider publicKey={process.env.NEXT_PUBLIC_MP_PUBLIC_KEY}>
  <MercadoPagoCheckoutDialog
    open={open}
    onClose={close}
    onSuccess={(payment) => setStatus(payment)}
    valor={199.9}
    descricao="Mensalidade Plano Pleno"
    clienteId={cliente._id}
    dadosUsuario={{ nome: cliente.responsavel, email: cliente.email }}
  />
</MercadoPagoProvider>
```

### 6.10 Mapas de navegacao rapida

| Categoria | Componentes chave |
| --- | --- |
| Estruturas base | `BannerCard`, `MegaMenu*`, `NavBasic*`, `NavSection*`, `Walktour*`, `SettingsDrawer`, `Scrollbar` |
| Formularios | `Hook-form` suite, `PhoneInput`, `CountrySelect`, `CustomDateRangePicker`, `CustomTabs`, `CustomPopover`, `CustomDialog` |
| Midia | `Image*`, `Lightbox`, `Upload*`, `FileThumbnail*`, `Logo*`, `Iconify*`, `SVGColor` |
| Feedback | `LoadingScreen`, `EmptyContent`, `FiltersResult`, `Label`, `Snackbar`, `SearchNotFound`, `ProgressBar` |
| Dados | `Table*`, `Chart*`, `Carousel*`, `OrganizationalChart`, `Map*` |

---

## 7. Fluxos de uso combinados

### 7.1 Dashboard de clientes

```jsx
import { useGetAllClientes } from 'src/actions/clientes';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

export function ClientesTable() {
  const table = useTable({ defaultRowsPerPage: 25 });
  const { data: clientes, isLoading } = useGetAllClientes({ plano: table.dense ? 'start' : undefined });

  return (
    <Card>
      <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={[{ id: 'nome', label: 'Nome' }]} />
      {/* Render rows */}
      <TablePaginationCustom rowsPerPage={table.rowsPerPage} onRowsPerPageChange={table.onRowsPerPageChange} />
    </Card>
  );
}
```

### 7.2 Checkout Mercado Pago com assinatura

1. Coletar pagamento: `MercadoPagoCheckoutDialog`.
2. Se aprovado, chamar `criarAssinatura(contratoId, cardToken)` e `criarAssinaturaMercadoPago` se precisar de replica no modulo contratos.
3. Monitorar com `usePagamentosCliente(clienteId)`.

### 7.3 Kanban comercial

```jsx
const { board, boardLoading } = useGetBoard();
await createTask(column.id, novaTask);
await moveTask(atualizarMapaDeTarefas(board.tasks, origem, destino));
```

Combinar com componentes `DragDropContext` e badges `Label`.

### 7.4 Portal do cliente

```jsx
const { data: servicos, mutate } = usePortalServicos(clienteId, { categoria: filtro });
await portalUpdateServico(servicoId, payload);
mutate(); // sincronia instantanea
```

Para layouts, use `src/components/banner`, `filters-result`, `empty-content`.

---

## 8. Boas praticas

- **SWR**: sempre reutilize os hooks existentes em `src/actions` para respeitar options (`revalidateOnFocus` etc.). Se criar novos, exporte do mesmo arquivo do dominio.
- **Mutacoes**: os metodos que usam `mutate` local (kanban, calendario, chat) nao persistem no servidor enquanto `enableServer` estiver `false`. Ative e implemente backend antes de distribuir.
- **Axios**: padronize novos endpoints adicionando-os ao objeto `endpoints` para evitar strings soltas.
- **Componentes**: importe sempre via caminho absoluto `src/components/...` para preservar tree-shaking.
- **Internacionalizacao**: este repo utiliza `pt-BR` como idioma padrao (`dayjs.locale('pt-br')`), entao mantenha textos uteis nesse idioma.
- **Testes/QA manual**: apos tocar funcoes financeiras, valide com os componentes `snackbar` (feedback) e `LoadingScreen` para evitar experiencias incompletas.

---

## 9. Referencias rapidas

- `SISTEMA-BANNERS.md`: detalha design system dos componentes de banner.
- `README.md`: setup de desenvolvimento e mock server.
- `src/sections/**`: blocos prontos para paginas de marketing; sao considerados especificos e nao entram como API publica, mas podem ser refeitos importando os componentes desta documentacao.

Sinta-se a vontade para evoluir este arquivo adicionando novas funcoes/exports sempre que surgirem.
