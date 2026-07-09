import { Page, View, Text, Font, Document, StyleSheet } from '@react-pdf/renderer';

import {
  getMargem,
  getCargaMensal,
  getCenarioLabel,
  getStatusOption,
  formatCompetencia,
  getClienteDisplay,
  getRecomendacaoLabel,
  getDiferencaCargaBase,
} from '../utils';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    lineHeight: 1.6,
    fontFamily: 'Roboto',
    backgroundColor: '#FFFFFF',
    padding: '32px 28px 64px 28px',
    color: '#212B36',
  },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  h2: { fontSize: 11, fontWeight: 700, marginBottom: 6, marginTop: 14 },
  muted: { color: '#637381' },
  small: { fontSize: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  headerBox: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e9ecef',
    paddingBottom: 10,
    marginBottom: 6,
  },
  heroBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#F4F6F8',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroValue: { fontSize: 15, fontWeight: 700, color: '#00A76F' },
  heroValueNegativo: { fontSize: 15, fontWeight: 700, color: '#B71D18' },
  table: { width: '100%', marginTop: 4 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e9ecef',
    paddingVertical: 5,
  },
  tableHead: { fontWeight: 700, backgroundColor: '#F4F6F8' },
  cellCenario: { width: '16%', paddingHorizontal: 4 },
  cellNum: { width: '14%', paddingHorizontal: 4, textAlign: 'right' },
  cellRecom: { width: '14%', paddingHorizontal: 4 },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  bulletDot: { width: 12 },
  colWrap: { flexDirection: 'row', gap: 16, marginTop: 4 },
  col: { flex: 1 },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e9ecef',
    paddingVertical: 3,
  },
  footer: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 24,
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e9ecef',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

// Formatadores locais (Intl): este componente é carregado por import dinâmico e
// não deve puxar a cadeia de src/utils (locales/tema) para dentro do bundle do PDF.
const fMoney = (value) =>
  value === null || value === undefined
    ? '—'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));

const fFraction = (value) =>
  value === null || value === undefined
    ? '—'
    : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(Number(value) * 100)}%`;

const fDataHora = (iso) => {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** resumoExecutivo vem em markdown simples; remove marcação para o PDF. */
const limparMarkdown = (texto) =>
  String(texto || '')
    .replaceAll('**', '')
    .replace(/^#+\s*/gm, '')
    .trim();

function KV({ label, value }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={{ fontWeight: 700 }}>{value}</Text>
    </View>
  );
}

// ----------------------------------------------------------------------

export function DiagnosticoPDF({ diagnostico }) {
  const resultado = diagnostico?.resultado || {};
  const comparativo = resultado.comparativo || {};
  const cenarios = comparativo.cenarios || [];
  const confiabilidade = resultado.confiabilidade || {};
  const baseDados = resultado.baseDados || {};
  const premissas = resultado.premissasAplicadas || diagnostico?.premissas || {};
  const planoAcao = resultado.planoAcao || [];

  const diferencaBase = getDiferencaCargaBase(comparativo);
  const temEconomia = diferencaBase !== null && diferencaBase < 0;
  const statusOption = getStatusOption(diagnostico?.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.headerBox}>
          <Text style={styles.h1}>Diagnóstico da Reforma Tributária</Text>
          <Text style={styles.muted}>
            Comparativo: Simples tradicional x Simples com IBS/CBS por fora
          </Text>
          <View style={[styles.row, { marginTop: 8 }]}>
            <View>
              <Text style={{ fontWeight: 700 }}>{getClienteDisplay(diagnostico)}</Text>
              <Text style={styles.muted}>
                Competência base: {formatCompetencia(diagnostico?.competenciaBase)}
              </Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text>Status: {statusOption.label}</Text>
              {resultado.calculadoEm && (
                <Text style={styles.muted}>Calculado em {fDataHora(resultado.calculadoEm)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Recomendação + economia */}
        <View style={styles.heroBox}>
          <View>
            <Text style={styles.muted}>Recomendação</Text>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>
              {getRecomendacaoLabel(comparativo.recomendacaoFinal)}
            </Text>
          </View>
          {diferencaBase !== null && (
            <View style={{ textAlign: 'right' }}>
              <Text style={styles.muted}>
                {temEconomia
                  ? 'Economia anual estimada (cenário base)'
                  : 'Custo anual adicional do híbrido (cenário base)'}
              </Text>
              <Text style={temEconomia ? styles.heroValue : styles.heroValueNegativo}>
                {fMoney(Math.abs(diferencaBase))}
              </Text>
            </View>
          )}
        </View>

        {comparativo.impactoCompetitividadeB2B && (
          <Text style={[styles.muted, { marginTop: 6 }]}>
            {comparativo.impactoCompetitividadeB2B}
          </Text>
        )}

        {/* Resumo executivo */}
        {resultado.resumoExecutivo && (
          <View>
            <Text style={styles.h2}>Resumo executivo</Text>
            <Text>{limparMarkdown(resultado.resumoExecutivo)}</Text>
          </View>
        )}

        {/* Cenários */}
        {cenarios.length > 0 && (
          <View>
            <Text style={styles.h2}>Comparativo por cenário</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHead]}>
                <Text style={styles.cellCenario}>Cenário</Text>
                <Text style={styles.cellNum}>Carga mensal S</Text>
                <Text style={styles.cellNum}>Carga mensal H</Text>
                <Text style={styles.cellNum}>Margem S</Text>
                <Text style={styles.cellNum}>Margem H</Text>
                <Text style={styles.cellNum}>Δ carga anual</Text>
                <Text style={styles.cellRecom}>Recomendação</Text>
              </View>
              {cenarios.map((cenario, index) => (
                <View style={styles.tableRow} key={cenario.nome || index}>
                  <Text style={[styles.cellCenario, { fontWeight: 700 }]}>
                    {getCenarioLabel(cenario.nome, index)}
                  </Text>
                  <Text style={styles.cellNum}>{fMoney(getCargaMensal(cenario.simples))}</Text>
                  <Text style={styles.cellNum}>{fMoney(getCargaMensal(cenario.hibrido))}</Text>
                  <Text style={styles.cellNum}>{fFraction(getMargem(cenario.simples))}</Text>
                  <Text style={styles.cellNum}>{fFraction(getMargem(cenario.hibrido))}</Text>
                  <Text style={styles.cellNum}>{fMoney(cenario.diferencaCargaAnual)}</Text>
                  <Text style={styles.cellRecom}>{getRecomendacaoLabel(cenario.recomendacao)}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.small, styles.muted, { marginTop: 3 }]}>
              S = Simples tradicional · H = híbrido (IBS/CBS por fora) · Δ = híbrido − simples
              (negativo = economia do híbrido)
            </Text>
          </View>
        )}

        {/* Base de dados + premissas */}
        <View style={styles.colWrap}>
          <View style={styles.col}>
            <Text style={styles.h2}>Base de dados (12 meses)</Text>
            <KV label="Receita acumulada" value={fMoney(baseDados.receitaUltimos12Meses)} />
            <KV label="Receita média mensal" value={fMoney(baseDados.receitaMediaMensalHistorica)} />
            <KV label="Guias pagas" value={fMoney(baseDados.totalGuiasUltimos12Meses)} />
            <KV label="Retenções" value={fMoney(baseDados.totalRetencoesUltimos12Meses)} />
            <KV label="Meses com receita" value={String(baseDados.mesesComReceita ?? '—')} />
          </View>
          <View style={styles.col}>
            <Text style={styles.h2}>Premissas aplicadas</Text>
            <KV label="Alíquota efetiva — Simples" value={fFraction(premissas.aliquotaSimplesEfetiva)} />
            <KV label="Alíquota efetiva — Híbrido" value={fFraction(premissas.aliquotaHibridoEfetiva)} />
            <KV label="Crédito aproveitável B2B" value={fFraction(premissas.percentualCreditoB2B)} />
            <KV
              label="Custo compliance híbrido"
              value={fMoney(premissas.custoComplianceHibridoMensal)}
            />
            {premissas.fonteAliquotas && (
              <Text style={[styles.small, styles.muted, { marginTop: 3 }]}>
                Fonte: {premissas.fonteAliquotas}
              </Text>
            )}
          </View>
        </View>

        {/* Plano de ação */}
        {planoAcao.length > 0 && (
          <View>
            <Text style={styles.h2}>Plano de ação</Text>
            {planoAcao.map((item, index) => {
              const texto =
                typeof item === 'string' ? item : item?.titulo || item?.descricao || item?.acao;
              return (
                <View style={styles.bullet} key={index}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={{ flex: 1 }}>{texto}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Confiabilidade */}
        {(confiabilidade.score !== undefined || (confiabilidade.pendencias || []).length > 0) && (
          <View>
            <Text style={styles.h2}>
              Confiabilidade dos dados{confiabilidade.score !== undefined ? `: ${confiabilidade.score}/100` : ''}
              {confiabilidade.nivel ? ` (${confiabilidade.nivel})` : ''}
            </Text>
            {(confiabilidade.pendencias || []).map((p, index) => (
              <View style={styles.bullet} key={index}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={{ flex: 1 }}>
                  {typeof p === 'string' ? p : p?.descricao || p?.mensagem || ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text style={[styles.small, styles.muted]}>
            Documento gerado pelo Hub Attualize — estimativas baseadas nas premissas informadas; não
            substitui análise contábil formal.
          </Text>
          <Text
            style={[styles.small, styles.muted]}
            render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
