/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '../components/common';
import { Colors, Font, Layout, Space } from '../../theme';
import { formatUGX } from '../utils/currency';

export function PaymentHistory() {
  const payments = [
    { id: '1', crop: 'Maize 500kg', date: 'Apr 5', amount: 727500, status: 'PAID', commission: 22500 },
    { id: '2', crop: 'Beans 200kg', date: 'Apr 10', amount: 142500, status: 'PAID', commission: 7500 },
    { id: '3', crop: 'Sweet Potato 300kg', date: 'Apr 12', amount: 300000, status: 'PROCESSING', commission: 0 },
  ];
  const total = payments.filter((payment) => payment.status === 'PAID').reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>My Payments</Text>

      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Total earned this month</Text>
        <Text style={styles.earningsVal}>{formatUGX(total)}</Text>
        <Text style={styles.earningsSub}>MTN Mobile Money - Active</Text>
      </View>

      {payments.map((payment) => (
        <View key={payment.id} style={styles.row}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.rowCrop}>{payment.crop} - {payment.date}</Text>
            {payment.commission > 0 && (
              <Text style={styles.rowCommission}>Platform fee: {formatUGX(payment.commission)}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={[styles.rowAmount, payment.status !== 'PAID' && { color: Colors.warning }]}>
              +{formatUGX(payment.amount)}
            </Text>
            <StatusBadge status={payment.status} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default PaymentHistory;

const styles = StyleSheet.create({
  scroll: { padding: Space.md, gap: Space.md },
  title: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  earningsCard: { backgroundColor: Colors.green, borderRadius: Layout.radius.lg, padding: Space.md, gap: 4 },
  earningsLabel: { fontSize: Font.size.caption, color: 'rgba(255,255,255,0.8)' },
  earningsVal: { fontSize: 28, fontWeight: Font.weight.bold, color: Colors.textInverse },
  earningsSub: { fontSize: Font.size.caption, color: 'rgba(255,255,255,0.75)' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  rowCrop: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },
  rowCommission: { fontSize: Font.size.caption, color: Colors.textMuted },
  rowAmount: { fontSize: 15, fontWeight: Font.weight.bold, color: Colors.green },
});
