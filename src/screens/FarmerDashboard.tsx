/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { FarmerStackParams } from '@navigation/RootNavigator';
import { Colors, Font, Space, Layout, getCropEmoji } from '@theme/index';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { selectUserProfile } from '@store/slices/userSlice';
import { selectActiveListings, fetchMyListings } from '@store/slices/listingSlice';
import { selectUnreadCount } from '@store/slices/notificationSlice';
import { StatusBadge } from '@components/common';
import { formatUGX } from '@utils/currency';
import { timeAgo } from '@utils/date';
import type { ProduceListing } from '@ekatale/types';

type Nav = NativeStackNavigationProp<FarmerStackParams>;

export default function FarmerDashboard() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectUserProfile);
  const listings = useAppSelector(selectActiveListings);
  const unreadCount = useAppSelector(selectUnreadCount);

  const { isLoading, refetch } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => dispatch(fetchMyListings()).unwrap(),
    staleTime: 5 * 60_000,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Farmer';
  const pendingCount = listings.filter(l => l.status === 'ORDER_CONFIRMED').length;

  return (
    <View style={s.root}>
      {/* Fixed green header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={s.menuIcon}>☰</Text>
          </TouchableOpacity>

          <Text style={s.headerTitle}>E-Katale</Text>

          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <TouchableOpacity>
              <Text style={{ fontSize: 20, color: '#fff' }}>🌐</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={s.bellWrap}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ fontSize: 22, color: '#fff' }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={s.notifBadge}>
                  <Text style={s.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.greeting}>{greeting()}, {firstName}! 👋</Text>

        {/* Weather strip */}
        <View style={s.weatherStrip}>
          <View style={{ gap: 2 }}>
            <Text style={s.weatherMain}>⛅ 24°C · Kampala</Text>
            <Text style={s.weatherTip}>💡 Good weather today — ideal for harvesting</Text>
          </View>
          <View style={s.rainTag}>
            <Text style={s.rainText}>🌧 Fri</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.body}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.green} />}
      >
        {/* Stats */}
        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statVal}>{listings.length}</Text>
            <Text style={s.statLbl}>Listings</Text>
          </View>
          <View style={[s.stat, s.statGreen]}>
            <Text style={[s.statVal, { color: Colors.green }]}>
              {formatUGX(0, { compact: true })}
            </Text>
            <Text style={s.statLbl}>Earned</Text>
          </View>
          <View style={[s.stat, pendingCount > 0 && s.statOrange]}>
            <Text style={[s.statVal, pendingCount > 0 && { color: Colors.warning }]}>
              {pendingCount}
            </Text>
            <Text style={s.statLbl}>Pending</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={s.sectionTitle}>What do you need?</Text>
        <View style={s.actionsGrid}>
          <ActionCard
            emoji="🌽" label="List Produce" sublabel="Register your harvest"
            bg="#E8F5E9" border="#A5D6A7" color={Colors.green}
            onPress={() => navigation.navigate('ListProduce')}
          />
          <ActionCard
            emoji="📊" label="Market Prices" sublabel="Check today's rates"
            bg="#E3F2FD" border="#90CAF9" color={Colors.info}
            onPress={() => navigation.navigate('PriceCheck')}
          />
          <ActionCard
            emoji="📋" label="My Orders" sublabel="Track your listings"
            bg="#FFF3E0" border="#FFCC80" color={Colors.warning}
            onPress={() => navigation.navigate('MyListings')}
          />
          <ActionCard
            emoji="🤖" label="AI Advisor" sublabel="Ask about your crops"
            bg="#F3E5F5" border="#CE93D8" color="#6A1B9A"
            onPress={() => navigation.navigate('AIAdvisor')}
          />
        </View>

        {/* Active listings */}
        {listings.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Active Listings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyListings')}>
                <Text style={s.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            {listings.slice(0, 3).map(l => (
              <ListingRow
                key={l.id}
                listing={l}
                onPress={() => navigation.navigate('ListingDetail', { listingId: l.id })}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {listings.length === 0 && !isLoading && (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🌱</Text>
            <Text style={s.emptyTitle}>No listings yet</Text>
            <Text style={s.emptyText}>
              List your produce to start receiving offers from the warehouse
            </Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => navigation.navigate('ListProduce')}
            >
              <Text style={s.emptyBtnText}>🌽 List Produce Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Truck tracking shortcut (if active) */}
        {pendingCount > 0 && (
          <View style={s.truckCard}>
            <Text style={s.truckEmoji}>🚚</Text>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.truckTitle}>Truck dispatched</Text>
              <Text style={s.truckSub}>A truck is on the way to collect your produce</Text>
            </View>
            <TouchableOpacity style={s.trackBtn}>
              <Text style={s.trackBtnText}>Track →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating List button */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('ListProduce')}
        activeOpacity={0.85}
      >
        <Text style={s.fabText}>+ List Produce</Text>
      </TouchableOpacity>
    </View>
  );
}

function ActionCard({
  emoji, label, sublabel, bg, border, color, onPress,
}: {
  emoji: string; label: string; sublabel: string;
  bg: string; border: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.actionCard, { backgroundColor: bg, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={s.actionEmoji}>{emoji}</Text>
      <Text style={[s.actionLabel, { color }]}>{label}</Text>
      <Text style={s.actionSub}>{sublabel}</Text>
    </TouchableOpacity>
  );
}

function ListingRow({ listing, onPress }: { listing: ProduceListing; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.listingRow} onPress={onPress} activeOpacity={0.75}>
      <View style={s.listingIcon}>
        <Text style={{ fontSize: 22 }}>{getCropEmoji(listing.commodityId)}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={s.listingName}>{listing.commodityName} — {listing.quantity}{listing.unit}</Text>
        <Text style={s.listingDate}>{timeAgo(listing.createdAt)}</Text>
      </View>
      <StatusBadge status={listing.status} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: { backgroundColor: Colors.green, padding: Space.md, paddingTop: Space.sm, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuIcon: { fontSize: 22, color: Colors.textInverse },
  headerTitle: { fontSize: 16, fontWeight: Font.weight.bold, color: Colors.textInverse },
  bellWrap: { position: 'relative' },
  notifBadge: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: Colors.gold, borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.green,
  },
  notifBadgeText: { fontSize: 9, color: Colors.textPrimary, fontWeight: Font.weight.bold },
  greeting: { fontSize: Font.size.body, fontWeight: Font.weight.semiBold, color: Colors.textInverse },
  weatherStrip: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Layout.radius.md,
    padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  weatherMain: { fontSize: Font.size.label, color: 'rgba(255,255,255,0.92)', fontWeight: Font.weight.medium },
  weatherTip: { fontSize: Font.size.caption, color: 'rgba(255,255,255,0.75)' },
  rainTag: { backgroundColor: 'rgba(249,168,37,0.25)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  rainText: { fontSize: 12, color: Colors.gold, fontWeight: Font.weight.bold },

  // Body
  body: { padding: Space.md, gap: Space.md, paddingBottom: 100 },

  // Stats
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Layout.radius.md,
    padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.border,
  },
  statGreen: { backgroundColor: Colors.greenLight, borderColor: Colors.greenBorder },
  statOrange: { backgroundColor: '#FFF3E0', borderColor: '#FFCC80' },
  statVal: { fontSize: 22, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  statLbl: { fontSize: Font.size.caption, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  // Actions
  sectionTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textSecondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: Font.size.label, color: Colors.green, fontWeight: Font.weight.medium },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    width: '47%', borderRadius: Layout.radius.lg, padding: 16,
    alignItems: 'center', gap: 5, borderWidth: 1,
    minHeight: 90,
  },
  actionEmoji: { fontSize: 30 },
  actionLabel: { fontSize: 14, fontWeight: Font.weight.bold, textAlign: 'center' },
  actionSub: { fontSize: Font.size.caption, color: Colors.textMuted, textAlign: 'center' },

  // Listings
  listingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: Layout.radius.md, padding: 14,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  listingIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.greenLight,
    alignItems: 'center', justifyContent: 'center',
  },
  listingName: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },
  listingDate: { fontSize: Font.size.caption, color: Colors.textMuted },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textSecondary },
  emptyText: { fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  emptyBtn: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 8,
  },
  emptyBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },

  // Truck card
  truckCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF3E0', borderRadius: Layout.radius.lg, padding: 14,
    borderWidth: 1, borderColor: '#FFCC80',
  },
  truckEmoji: { fontSize: 28 },
  truckTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.warning },
  truckSub: { fontSize: Font.size.caption, color: '#8D4E00' },
  trackBtn: { backgroundColor: Colors.warning, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  trackBtnText: { fontSize: 13, fontWeight: Font.weight.bold, color: Colors.textInverse },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    backgroundColor: Colors.green, borderRadius: Layout.radius.pill,
    paddingVertical: 16, paddingHorizontal: 32,
    elevation: 8, shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  fabText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
});
