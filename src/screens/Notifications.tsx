/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Font, Space } from '../../theme';
import { useAppSelector } from '../store/hooks';
import { selectNotifications } from '../store/slices/notificationSlice';

const MOCK = [
  { id: '1', icon: '🚚', bg: '#FFF3E0', title: 'Truck dispatched', msg: 'Arriving in ~2 hours to collect your maize', ts: '2 hours ago', unread: true },
  { id: '2', icon: '📋', bg: '#E3F2FD', title: 'New order placed', msg: 'Warehouse ordered 500kg of your maize', ts: '5 hours ago', unread: true },
  { id: '3', icon: '💰', bg: '#E8F5E9', title: 'Payment received', msg: 'UGX 150,000 sent to your MTN MoMo', ts: 'Yesterday', unread: false },
];

export function Notifications() {
  useAppSelector(selectNotifications);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity><Text style={styles.markAll}>Mark all read</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: Space.md, gap: 2 }} showsVerticalScrollIndicator={false}>
        {MOCK.map((item, index) => (
          <View key={item.id}>
            {index === 0 && <Text style={styles.dayLabel}>TODAY</Text>}
            <TouchableOpacity style={[styles.row, item.unread && styles.rowUnread]}>
              {item.unread && <View style={styles.dot} />}
              <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowMsg} numberOfLines={2}>{item.msg}</Text>
                <Text style={styles.rowTs}>{item.ts}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default Notifications;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    padding: Space.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  markAll: { fontSize: Font.size.label, color: Colors.info, fontWeight: Font.weight.medium },
  dayLabel: {
    fontSize: 10,
    fontWeight: Font.weight.bold,
    color: Colors.textMuted,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowUnread: { backgroundColor: '#F8FFF8' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.info, marginTop: 6, flexShrink: 0 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  rowMsg: { fontSize: Font.size.caption, color: Colors.textSecondary, lineHeight: 18 },
  rowTs: { fontSize: 11, color: Colors.textMuted },
});
