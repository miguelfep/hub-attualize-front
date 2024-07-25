import { useMemo } from 'react';
import { Page, View, Text, Font, Link, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        // layout
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
        // margin
        mb4: { marginBottom: 4 },
        mb8: { marginBottom: 8 },
        mb40: { marginBottom: 40 },
        // text
        h3: { fontSize: 16, fontWeight: 700 },
        h4: { fontSize: 13, fontWeight: 700 },
        body1: { fontSize: 10 },
        subtitle1: { fontSize: 10, fontWeight: 700 },
        body2: { fontSize: 9 },
        subtitle2: { fontSize: 9, fontWeight: 700 },
        // table
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

// ----------------------------------------------------------------------

export function InvoicePDF({ invoice, currentStatus }) {
  const { items, desconto, subTotal, total, createdAt, dataVencimento, invoiceNumber, cliente } =
    invoice;

  const styles = useStyles();

  const renderHeader = (
    <View style={[styles.container, styles.mb40]}>
      <Image source="/logo/hub-tt.png" style={{ width: 48, height: 48 }} />

      <View style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
        <Text style={[styles.h3, { textTransform: 'capitalize' }]}>{currentStatus}</Text>
        <Text> {invoiceNumber} </Text>
      </View>
    </View>
  );

  const renderFooter = (
    <View style={[styles.container, styles.footer]} fixed>
      <View style={{ width: '75%' }}>
        <Text style={styles.subtitle2}>Informações</Text>
        <Text>Pagamento atráves de boleto ou pix</Text>
      </View>
      <View style={{ width: '25%', textAlign: 'right' }}>
        <Text style={styles.subtitle2}>Alguma duvida?</Text>
        <Link src="https://wa.me/554196982267" style={styles.body2}>
          (41) 99698-2267 (WhatsApp)
        </Link>
      </View>
    </View>
  );

  const renderInfo = (
    <View style={[styles.container, styles.mb40]}>
      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Contratado</Text>
        <Text style={styles.body2}>Attualize Contabil LTDA</Text>
        <Text style={styles.body2}>Rua dias da rocha Filho 640</Text>
        <Text style={styles.body2}>Curitiba - PR</Text>
        <Link src="https://wa.me/554130681800" style={styles.body2}>
          (41) 3068-1800 (WhatsApp)
        </Link>
      </View>

      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Contratante</Text>
        <Text style={styles.body2}>{invoice.cliente.nome}</Text>
        <Text style={styles.body2}>{invoice.cliente.email}</Text>
        <Text style={styles.body2}>{invoice.cliente.whatsapp}</Text>
      </View>
    </View>
  );

  const renderTime = (
    <View style={[styles.container, styles.mb40]}>
      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Criada em:</Text>
        <Text style={styles.body2}>{fDate(createdAt)}</Text>
      </View>
      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Validade até</Text>
        <Text style={styles.body2}>{fDate(dataVencimento)}</Text>
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
          {items.map((item, index) => (
            <View key={item._id} style={styles.row}>
              <View style={styles.cell_1}>
                <Text>{index + 1}</Text>
              </View>
              <View style={styles.cell_2}>
                <Text style={styles.subtitle2}>{item.titulo}</Text>
                <Text>{item.descricao}</Text>
              </View>
              <View style={styles.cell_3}>
                <Text>{item.quantidade}</Text>
              </View>
              <View style={styles.cell_4}>
                <Text>{fCurrency(item.preco)}</Text>
              </View>
              <View style={[styles.cell_5, { textAlign: 'right' }]}>
                <Text>{fCurrency(item.preco * item.quantidade)}</Text>
              </View>
            </View>
          ))}

          {[
            { name: 'Subtotal', value: subTotal },
            { name: 'Disconto', value: -desconto },
            { name: 'Total', value: total, styles: styles.h4 },
          ].map((item) => (
            <View key={item.name} style={[styles.row, styles.noBorder]}>
              <View style={styles.cell_1} />
              <View style={styles.cell_2} />
              <View style={styles.cell_3} />
              <View style={styles.cell_4}>
                <Text style={item.styles}>{item.name}</Text>
              </View>
              <View style={[styles.cell_5, { textAlign: 'right' }]}>
                <Text style={item.styles}>{fCurrency(item.value)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader}

        {renderInfo}

        {renderTime}

        {renderTable}

        {renderFooter}
      </Page>
    </Document>
  );
}
