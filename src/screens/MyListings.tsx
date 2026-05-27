/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { FarmerStackParams } from '../navigation/RootNavigator';
import { Colors, Font, Space, Layout, getCropEmoji } from '../../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyListings, selectAllListings } from '../store/slices/listingSlice';
import { Button, EmptyState, StatusBadge } from '../components/common';
import { timeAgo } from '../utils/date';
import type { ProduceListing } from '../types';

type Nav = NativeStackNavigationProp<FarmerStackParams>;
type Tab = 'active' | 'completed' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
];

export function MyListings() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<Tab>('active');
  const listings = useAppSelector(selectAllListings);

  const { isLoading, refetch } = useQuery({
    queryKey: ['listings'],
    queryFn: () => dispatch(fetchMyListings()).unwrap(),
  });

  const filtered = listings.filter((listing) => {
    if (tab === 'active') return !['PAID', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(listing.status);
    if (tab === 'completed') return ['PAID', 'REJECTED', 'CANCELLED'].includes(listing.status);
    return true;
  });

  const renderItem = ({ item }: { item: ProduceListing }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
      activeOpacity={0.75}
    >
      <View style={styles.icon}>
        <Text style={{ fontSize: 24 }}>{getCropEmoji(item.commodityId)}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.name}>{item.commodityName} - {item.quantity}{item.unit}</Text>
        <Text style={styles.date}>{timeAgo(item.createdAt)}</Text>
      </View>
      <StatusBadge status={item.status} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <View style={styles.tabs}>
          {TABS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.tab, tab === item.key && styles.tabActive]}
              onPress={() => setTab(item.key)}
            >
              <Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: Space.md, gap: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.green} />}
        ListEmptyComponent={
          <EmptyState
            emoji="📋"
            title={tab === 'active' ? 'No active listings' : 'No completed orders'}
            description="List your produce to start receiving offers"
            action={<Button label="+ List Produce" onPress={() => navigation.navigate('ListProduce')} />}
          />
        }
      />
    </View>
  );
}

export default MyListings;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Space.md,
    paddingTop: Space.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary, marginBottom: Space.sm },
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.green },
  tabText: { fontSize: Font.size.label, fontWeight: Font.weight.medium, color: Colors.textMuted },
  tabTextActive: { color: Colors.green, fontWeight: Font.weight.bold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },
  date: { fontSize: Font.size.caption, color: Colors.textMuted },
});
