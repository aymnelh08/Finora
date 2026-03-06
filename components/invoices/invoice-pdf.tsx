import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts if needed, or use standard
Font.register({
    family: 'Helvetica-Bold',
    src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' // Fallback or use standard
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#0A0A0A',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#001F54',
    },
    invoiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#001F54',
        textAlign: 'right',
    },
    invoiceMeta: {
        textAlign: 'right',
        fontSize: 10,
        color: '#666',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    section: {
        width: '45%',
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#999',
        textTransform: 'uppercase',
    },
    text: {
        marginBottom: 2,
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#001F54',
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        paddingBottom: 6,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    colDesc: { width: '50%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },

    totalSection: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginTop: 10,
    },
    totalRow: {
        flexDirection: 'row',
        marginBottom: 4,
        width: '40%',
        justifyContent: 'space-between',
    },
    grandTotal: {
        flexDirection: 'row',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        width: '40%',
        justifyContent: 'space-between',
    },
    grandTotalText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#001F54',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#999',
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
    },
});

interface InvoicePDFProps {
    invoice: {
        id: string;
        invoice_number: string;
        issue_date: string;
        due_date: string;
        client_name: string;
        client_address?: string;
        subtotal: number;
        vat_amount: number;
        total_amount: number;
        currency: string;
        notes?: string;
        line_items?: Array<{
            description: string;
            quantity: number;
            unit_price: number;
            total: number;
        }>;
    };
    businessDetails: {
        name: string;
        email: string;
        address: string;
        ice?: string; // Tax ID
    }
    logoUrl?: string;
    businessName?: string;
}

export const InvoicePDF = ({ invoice, businessDetails, logoUrl, businessName }: InvoicePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <View>
                    {logoUrl ? (
                        <Image src={logoUrl} style={{ width: 80, height: 80, objectFit: 'contain' }} />
                    ) : (
                        <Text style={styles.logo}>{businessName || 'FINORA'}</Text>
                    )}
                    <Text style={styles.text}>{businessDetails.email}</Text>
                    <Text style={styles.text}>{businessDetails.address}</Text>
                </View>
                <View>
                    <Text style={styles.invoiceTitle}>INVOICE</Text>
                    <Text style={styles.invoiceMeta}># {invoice.invoice_number}</Text>
                    <Text style={styles.invoiceMeta}>Date: {invoice.issue_date}</Text>
                    <Text style={styles.invoiceMeta}>Due: {invoice.due_date}</Text>
                </View>
            </View>

            {/* Bill To */}
            <View style={styles.row}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill To</Text>
                    <Text style={[styles.text, { fontWeight: 'bold' }]}>{invoice.client_name}</Text>
                    {invoice.client_address && (
                        <Text style={styles.text}>{invoice.client_address}</Text>
                    )}
                </View>
            </View>

            {/* Line Items */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.colDesc, { fontWeight: 'bold', color: '#001F54' }]}>Description</Text>
                    <Text style={[styles.colQty, { fontWeight: 'bold', color: '#001F54' }]}>Qty</Text>
                    <Text style={[styles.colPrice, { fontWeight: 'bold', color: '#001F54' }]}>Price</Text>
                    <Text style={[styles.colTotal, { fontWeight: 'bold', color: '#001F54' }]}>Total</Text>
                </View>
                {invoice.line_items?.map((item, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={styles.colDesc}>{item.description}</Text>
                        <Text style={styles.colQty}>{item.quantity}</Text>
                        <Text style={styles.colPrice}>{Number(item.unit_price).toFixed(2)}</Text>
                        <Text style={styles.colTotal}>{Number(item.total).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text>Subtotal</Text>
                    <Text>{Number(invoice.subtotal).toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text>VAT (20%)</Text>
                    <Text>{Number(invoice.vat_amount).toFixed(2)}</Text>
                </View>
                <View style={styles.grandTotal}>
                    <Text style={styles.grandTotalText}>Total {invoice.currency}</Text>
                    <Text style={styles.grandTotalText}>{Number(invoice.total_amount).toFixed(2)}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Thank you for your business. Payment is due within 30 days.</Text>
                <Text>Bank Details: CIH Bank • RIB: 230 780 1234567890123456 00</Text>
                {businessDetails.ice && <Text>ICE: {businessDetails.ice}</Text>}
            </View>

        </Page>
    </Document>
);
