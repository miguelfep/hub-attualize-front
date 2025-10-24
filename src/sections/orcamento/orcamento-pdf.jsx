'use client';

import { useMemo } from 'react';
import { Page, View, Text, Font, Link, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fCurrency } from 'src/utils/format-number';

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        page: {
          fontSize: 9,
          lineHeight: 1.6,
          fontFamily: 'Roboto',
          backgroundColor: '#FFFFFF',
          padding: '40px 24px 120px 24px',
        },
        footer: {
          left: 0,
          right: 0,
          bottom: 0,
          padding: 24,
          margin: 'auto',
          borderTopWidth: 1,
          borderStyle: 'solid',
          position: 'absolute',
          borderColor: '#e9ecef',
        },
        container: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        mb4: { marginBottom: 4 },
        mb8: { marginBottom: 8 },
        mb16: { marginBottom: 16 },
        mb40: { marginBottom: 40 },
        h3: { fontSize: 16, fontWeight: 700 },
        h4: { fontSize: 13, fontWeight: 700 },
        body1: { fontSize: 10 },
        subtitle1: { fontSize: 10, fontWeight: 700 },
        body2: { fontSize: 9 },
        subtitle2: { fontSize: 9, fontWeight: 700 },
        table: { display: 'flex', width: '100%' },
        row: {
          padding: '10px 0 8px 0',
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: '#e9ecef',
        },
        cell_1: { width: '5%' },
        cell_2: { width: '50%' },
        cell_3: { width: '15%', paddingLeft: 32 },
        cell_4: { width: '15%', paddingLeft: 8 },
        cell_5: { width: '15%' },
        noBorder: { paddingTop: '10px', paddingBottom: 0, borderBottomWidth: 0 },
      }),
    []
  );

export function OrcamentoPDF({ orcamento, settings }) {
  const styles = useStyles();

  const itens = Array.isArray(orcamento?.itens) ? orcamento.itens : [];
  const subtotal = itens.reduce((acc, it) => acc + (Number(it.quantidade || 0) * Number(it.valorUnitario || 0) - Number(it.desconto || 0)), 0);
  const descontoGeral = Number(orcamento?.descontoGeral || 0);
  const total = subtotal - descontoGeral;

  const empresaLogo = settings?.eNotasConfig?.configuracaoEmpresa?.logo || '';

  const renderHeader = (
    <View style={[styles.container, styles.mb40]}>
      {empresaLogo ? (
        <Image source={empresaLogo} style={{ width: 48, height: 48 }} />
      ) : (
        <View style={{ width: 48, height: 48 }} />
      )}
      <View style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
        <Text style={[styles.h3, { textTransform: 'capitalize' }]}>Orçamento {orcamento?.numero || ''}</Text>
        <Text>{orcamento?.status}</Text>
      </View>
    </View>
  );

  const renderFooter = (
    <View style={[styles.container, styles.footer]} fixed>
      <View style={{ width: '75%' }}>
        <Text style={styles.subtitle2}>Informações</Text>
        <Text>Pagamento através de boleto ou pix</Text>
      </View>
      <View style={{ width: '25%', textAlign: 'right' }}>
        <Text style={styles.subtitle2}>Alguma dúvida?</Text>
        <Link src={`https://wa.me/55${orcamento?.clienteProprietarioId?.whatsapp}`} style={styles.body2}>
           {orcamento?.clienteProprietarioId?.whatsapp} (WhatsApp)
        </Link>
      </View>
    </View>
  );

  const renderInfo = (
    <View style={[styles.container, styles.mb40]}>
      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Contratado</Text>
        <Text style={styles.body2}>{orcamento?.clienteProprietarioId?.razaoSocial || orcamento?.clienteProprietarioId?.razaoSocial || ''}</Text>
        <Text style={styles.body2}>{orcamento?.clienteProprietarioId?.cnpj || orcamento?.clienteProprietarioId?.cnpj || ''}</Text>
    
        <Link src={`https://wa.me/55${orcamento?.clienteProprietarioId?.whatsapp}`} style={styles.body2}>
          {orcamento?.clienteProprietarioId?.whatsapp} (WhatsApp)
        </Link>
      </View>
      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Contratante</Text>
        <Text style={styles.body2}>{orcamento?.clienteDoClienteId?.nome || orcamento?.cliente?.nome || ''}</Text>
        {orcamento?.clienteDoClienteId?.email ? <Text style={styles.body2}>{orcamento?.clienteDoClienteId?.email}</Text> : null}
        {orcamento?.clienteDoClienteId?.whatsapp ? <Text style={styles.body2}>{orcamento?.clienteDoClienteId?.whatsapp}</Text> : null}
      </View>
    </View>
  );

  const renderTable = (
    <>
      <Text style={[styles.subtitle1, styles.mb8]}>Detalhes</Text>
      <View style={styles.table}>
        <View>
          <View style={styles.row}>
            <View style={styles.cell_1}>
              <Text style={styles.subtitle2}>#</Text>
            </View>
            <View style={styles.cell_2}>
              <Text style={styles.subtitle2}>Descrição</Text>
            </View>
            <View style={styles.cell_3}>
              <Text style={styles.subtitle2}>Qtd</Text>
            </View>
            <View style={styles.cell_4}>
              <Text style={styles.subtitle2}>Preço</Text>
            </View>
            <View style={[styles.cell_5, { textAlign: 'right' }]}>
              <Text style={styles.subtitle2}>Total</Text>
            </View>
          </View>
        </View>

        <View>
          {itens.map((item, index) => (
            <View key={`${index}-${item?.descricao || item?.servicoId?._id || 'item'}`} style={styles.row}>
              <View style={styles.cell_1}>
                <Text>{index + 1}</Text>
              </View>
              <View style={styles.cell_2}>
                <Text style={styles.subtitle2}>{item?.descricao || item?.servicoId?.nome}</Text>
                {item?.observacao ? <Text>{item.observacao}</Text> : null}
              </View>
              <View style={styles.cell_3}>
                <Text>{item?.quantidade}</Text>
              </View>
              <View style={styles.cell_4}>
                <Text>{fCurrency(Number(item?.valorUnitario || 0))}</Text>
              </View>
              <View style={[styles.cell_5, { textAlign: 'right' }]}>
                <Text>{fCurrency(Number(item?.quantidade || 0) * Number(item?.valorUnitario || 0) - Number(item?.desconto || 0))}</Text>
              </View>
            </View>
          ))}

          {[
            { name: 'Subtotal', value: subtotal },
            { name: 'Desconto', value: -descontoGeral },
            { name: 'Total', value: total, styles: styles.h4 },
          ].map((line) => (
            <View key={line.name} style={[styles.row, styles.noBorder]}>
              <View style={styles.cell_1} />
              <View style={styles.cell_2} />
              <View style={styles.cell_3} />
              <View style={styles.cell_4}>
                <Text style={line.styles}>{line.name}</Text>
              </View>
              <View style={[styles.cell_5, { textAlign: 'right' }]}>
                <Text style={line.styles}>{fCurrency(line.value)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      {(orcamento?.observacoes || orcamento?.condicoesPagamento) && (
        <View style={[styles.mb16, { marginTop: 16 }]}>
          {orcamento?.observacoes ? (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.subtitle1}>Observações</Text>
              <Text style={styles.body2}>{orcamento.observacoes}</Text>
            </View>
          ) : null}
          {orcamento?.condicoesPagamento ? (
            <View>
              <Text style={styles.subtitle1}>Condições de Pagamento</Text>
              <Text style={styles.body2}>{orcamento.condicoesPagamento}</Text>
            </View>
          ) : null}
        </View>
      )}
    </>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader}
        {renderInfo}
        {renderTable}
        {renderFooter}
      </Page>
    </Document>
  );
}


