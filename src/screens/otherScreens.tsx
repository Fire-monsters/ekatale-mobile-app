/* eslint-disable react-native/no-inline-styles */
/**
 * MyListings — status-driven order list
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { FarmerStackParams } from '@navigation/RootNavigator';
import { Colors, Font, Space, Layout, getCropEmoji } from '@theme/index';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectAllListings, fetchMyListings } from '@store/slices/listingSlice';
import { StatusBadge, EmptyState, Button } from '@components/common';
import { timeAgo } from '@utils/date';
import type { ProduceListing } from '@ekatale/types';

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

  const filtered = listings.filter(l => {
    if (tab === 'active') return !['PAID','REJECTED','EXPIRED','CANCELLED'].includes(l.status);
    if (tab === 'completed') return ['PAID','REJECTED','CANCELLED'].includes(l.status);
    return true;
  });

  const renderItem = ({ item: l }: { item: ProduceListing }) => (
    <TouchableOpacity
      style={s2.row}
      onPress={() => navigation.navigate('ListingDetail', { listingId: l.id })}
      activeOpacity={0.75}
    >
      <View style={s2.icon}>
        <Text style={{ fontSize: 24 }}>{getCropEmoji(l.commodityId)}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={s2.name}>{l.commodityName} — {l.quantity}{l.unit}</Text>
        <Text style={s2.date}>{timeAgo(l.createdAt)}</Text>
      </View>
      <StatusBadge status={l.status} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={s2.header}>
        <Text style={s2.title}>My Orders</Text>
        <View style={s2.tabs}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[s2.tab, tab === t.key && s2.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[s2.tabText, tab === t.key && s2.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={l => l.id}
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

const s2 = StyleSheet.create({
  header: { 
    backgroundColor: Colors.surface,
    paddingHorizontal: Space.md,
    paddingTop: Space.md,
    paddingBottom: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border
 },
  title: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary, marginBottom: Space.sm },
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.green },
  tabText: { fontSize: Font.size.label, fontWeight: Font.weight.medium, color: Colors.textMuted },
  tabTextActive: { color: Colors.green, fontWeight: Font.weight.bold },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: Layout.radius.md,
    padding: 14, borderWidth: 0.5, borderColor: Colors.border,
  },
  icon: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },
  date: { fontSize: Font.size.caption, color: Colors.textMuted },
});

// ─────────────────────────────────────────────

/**
 * PriceCheck — market comparison with visual bars
 */
import { formatUGX, formatTrend } from '@utils/currency';
import { SectionHeader } from '@components/common';

const PRICE_CROPS = [
  { id: 'maize',   label: 'Maize'   },
  { id: 'beans',   label: 'Beans'   },
  { id: 'cassava', label: 'Cassava' },
  { id: 'matooke', label: 'Matooke' },
];

export function PriceCheck() {
  const [crop, setCrop] = useState('maize');

  // Mock data — replace with API
  const price = { current: 1500, floor: 1200, ceiling: 1800, trend: 'RISING' as const, trendPct: 5.3 };
  const markets = [
    { name: 'Owek. Market',   price: 1200, vs: 'lower'  },
    { name: 'E-Katale Offer', price: 1500, vs: 'katale' },
    { name: 'Kampala Whlsl.', price: 1800, vs: 'higher' },
  ];

  return (
    <ScrollView style={{ flex:1, backgroundColor: Colors.bg }} contentContainerStyle={s3.scroll} showsVerticalScrollIndicator={false}>
      <Text style={s3.title}>Market Prices</Text>

      {/* Crop tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection:'row', gap:8 }}>
          {PRICE_CROPS.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[s3.cropPill, crop === c.id && s3.cropPillActive]}
              onPress={() => setCrop(c.id)}
            >
              <Text style={s3.cropEmoji}>{getCropEmoji(c.id)}</Text>
              <Text style={[s3.cropPillText, crop === c.id && s3.cropPillTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Price hero */}
      <View style={s3.priceCard}>
        <Text style={s3.priceLabel}>E-Katale farmgate price today</Text>
        <View style={{ flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between' }}>
          <Text style={s3.priceVal}>
            {formatUGX(price.current)}<Text style={s3.priceUnit}>/kg</Text>
          </Text>
          <View style={[s3.trendBadge, { backgroundColor: Colors.greenLight }]}>
            <Text style={[s3.trendText, { color: Colors.green }]}>↑ {formatTrend(price.trendPct)}</Text>
          </View>
        </View>
        {/* Sparkline */}
        <View style={s3.spark}>
          {[60,70,50,65,80,75,100].map((h, i) => (
            <View key={i} style={[s3.sparkBar, { height: h * 0.28 }, i === 6 && s3.sparkBarHi]} />
          ))}
        </View>
        <Text style={s3.sparkLabel}>7-day trend</Text>
      </View>

      {/* Market comparison */}
      <SectionHeader title="Market Comparison" />
      {markets.map(m => (
        <View key={m.name} style={[s3.marketRow, m.vs === 'katale' && s3.marketRowKatale]}>
          <Text style={s3.marketName}>{m.name}</Text>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <View style={[s3.marketBar, { width: `${(m.price / 1800) * 100}%`,
              backgroundColor: m.vs === 'katale' ? Colors.green : m.vs === 'higher' ? Colors.info : '#E0E0E0'
            }]} />
          </View>
          <Text style={[s3.marketPrice, {
            color: m.vs === 'katale' ? Colors.green : m.vs === 'higher' ? Colors.info : Colors.error
          }]}>
            {formatUGX(m.price)}/kg
          </Text>
        </View>
      ))}

      {/* Demand */}
      <View style={s3.demandCard}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <Text style={s3.demandTitle}>Demand Level</Text>
          <View style={{ backgroundColor:'#FFEBEE', borderRadius:6, paddingHorizontal:8, paddingVertical:3 }}>
            <Text style={{ fontSize:12, color:Colors.error, fontWeight:Font.weight.bold }}>🔴 High</Text>
          </View>
        </View>
        <Text style={{ fontSize: Font.size.label, color: Colors.warning }}>
          Maize is in high demand this week. Good time to sell!
        </Text>
      </View>
    </ScrollView>
  );
}

const s3 = StyleSheet.create({
  scroll: { padding: Space.md, gap: Space.md },
  title: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  cropPill: {
    flexDirection:'row', alignItems:'center', gap:6,
    paddingHorizontal:14, paddingVertical:10,
    borderRadius: Layout.radius.pill, borderWidth:2, borderColor:'#E5E7EB', backgroundColor: Colors.bg,
  },
  cropPillActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  cropEmoji: { fontSize: 18 },
  cropPillText: { fontSize:14, fontWeight: Font.weight.medium, color: Colors.textMuted },
  cropPillTextActive: { color: Colors.green },
  priceCard: {
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.lg,
    padding: Space.md, borderWidth:0.5, borderColor: Colors.greenBorder, gap: 8,
  },
  priceLabel: { fontSize: Font.size.caption, color: Colors.textMuted },
  priceVal: { fontSize: 32, fontWeight: Font.weight.bold, color: Colors.green },
  priceUnit: { fontSize: 16, color: Colors.textMuted, fontWeight: Font.weight.regular },
  trendBadge: { paddingHorizontal:10, paddingVertical:5, borderRadius:8 },
  trendText: { fontSize:14, fontWeight: Font.weight.bold },
  spark: { flexDirection:'row', alignItems:'flex-end', gap:4, height:32 },
  sparkBar: { width:12, backgroundColor:'#A5D6A7', borderRadius:3 },
  sparkBarHi: { backgroundColor: Colors.green },
  sparkLabel: { fontSize: Font.size.caption, color: Colors.textMuted },
  marketRow: {
    flexDirection:'row', alignItems:'center', backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md, padding:12, borderWidth:0.5, borderColor: Colors.border,
  },
  marketRowKatale: { borderColor: Colors.greenBorder, backgroundColor: Colors.greenLight },
  marketName: { fontSize: Font.size.label, fontWeight: Font.weight.medium, color: Colors.textSecondary, width: 110 },
  marketBar: { height:8, borderRadius:4 },
  marketPrice: { fontSize: Font.size.label, fontWeight: Font.weight.bold },
  demandCard: {
    backgroundColor:'#FFF3E0', borderRadius: Layout.radius.md,
    padding: Space.md, borderWidth:0.5, borderColor:'#FFCC80',
  },
  demandTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.textSecondary },
});

// ─────────────────────────────────────────────

/**
 * PaymentHistory
 */
export function PaymentHistory() {
  const payments = [
    { id:'1', crop:'Maize 500kg', date:'Apr 5', amount:727500, status:'PAID', commission:22500 },
    { id:'2', crop:'Beans 200kg', date:'Apr 10', amount:142500, status:'PAID', commission:7500 },
    { id:'3', crop:'Sweet Potato 300kg', date:'Apr 12', amount:300000, status:'PROCESSING', commission:0 },
  ];
  const total = payments.filter(p => p.status === 'PAID').reduce((s,p) => s + p.amount, 0);

  return (
    <ScrollView style={{ flex:1, backgroundColor: Colors.bg }} contentContainerStyle={s4.scroll} showsVerticalScrollIndicator={false}>
      <Text style={s4.title}>My Payments</Text>

      <View style={s4.earningsCard}>
        <Text style={s4.earningsLabel}>Total earned this month</Text>
        <Text style={s4.earningsVal}>{formatUGX(total)}</Text>
        <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginTop:4 }}>
          <View style={{ width:8, height:8, borderRadius:4, backgroundColor:'#4CAF50' }} />
          <Text style={s4.earningsSub}>MTN Mobile Money · Active</Text>
        </View>
      </View>

      {payments.map(p => (
        <View key={p.id} style={s4.row}>
          <View style={{ flex:1, gap:3 }}>
            <Text style={s4.rowCrop}>{p.crop} · {p.date}</Text>
            {p.commission > 0 && (
              <Text style={s4.rowCommission}>Platform fee: {formatUGX(p.commission)}</Text>
            )}
          </View>
          <View style={{ alignItems:'flex-end', gap:4 }}>
            <Text style={[s4.rowAmount, p.status !== 'PAID' && { color: Colors.warning }]}>
              +{formatUGX(p.amount)}
            </Text>
            <StatusBadge status={p.status} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s4 = StyleSheet.create({
  scroll: { padding: Space.md, gap: Space.md },
  title: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  earningsCard: { backgroundColor: Colors.green, borderRadius: Layout.radius.lg, padding: Space.md, gap:4 },
  earningsLabel: { fontSize: Font.size.caption, color:'rgba(255,255,255,0.8)' },
  earningsVal: { fontSize: 28, fontWeight: Font.weight.bold, color: Colors.textInverse },
  earningsSub: { fontSize: Font.size.caption, color:'rgba(255,255,255,0.75)' },
  row: {
    flexDirection:'row', alignItems:'center',
    backgroundColor: Colors.surface, borderRadius: Layout.radius.md,
    padding:14, borderWidth:0.5, borderColor: Colors.border,
  },
  rowCrop: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },
  rowCommission: { fontSize: Font.size.caption, color: Colors.textMuted },
  rowAmount: { fontSize:15, fontWeight: Font.weight.bold, color: Colors.green },
});

// ─────────────────────────────────────────────

/**
 * AIAdvisor — multilingual chat
 */
import { KeyboardAvoidingView, Platform, TextInput } from 'react-native';

type ChatMsg = { id: string; role: 'user' | 'ai'; text: string };

const QUICK = ['Best time to plant maize?', 'Current maize price?', 'How to treat leaf spots?'];

export function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id:'0', role:'ai', text:"Hello! 👋 How can I help with your farm today? I can advise on crops, prices, weather, or your active orders." },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setMessages(m => [...m, { id: String(Date.now()), role:'user', text }]);
    setInput('');
    setBusy(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    setMessages(m => [...m, {
      id: String(Date.now()+1), role:'ai',
      text: text.toLowerCase().includes('price')
        ? '📊 Current E-Katale maize price: UGX 1,500/kg — up 5.3% this week. High demand right now, good time to sell!'
        : '🌱 Good question! Based on your location in Mukono and the current season, I recommend checking soil moisture before Friday rain. Let me know if you want specific advice for your crops.',
    }]);
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor: Colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={s5.header}>
        <Text style={s5.headerTitle}>🤖 AI Farm Advisor</Text>
        <View style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
          <View style={{ width:8, height:8, borderRadius:4, backgroundColor:'#4CAF50' }} />
          <Text style={s5.onlineText}>Online</Text>
        </View>
      </View>

      {/* Quick replies */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s5.quickBar} contentContainerStyle={{ gap:8, padding:10 }}>
        {QUICK.map(q => (
          <TouchableOpacity key={q} style={s5.quickBtn} onPress={() => send(q)}>
            <Text style={s5.quickText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView style={{ flex:1 }} contentContainerStyle={{ gap:10, padding:Space.md, paddingBottom: 20 }}>
        {messages.map(m => (
          <View key={m.id} style={[s5.bubble, m.role === 'user' ? s5.userBubble : s5.aiBubble]}>
            {m.role === 'ai' && <Text style={s5.aiLabel}>AI</Text>}
            <Text style={[s5.bubbleText, m.role === 'user' && s5.userText]}>{m.text}</Text>
          </View>
        ))}
        {busy && (
          <View style={[s5.aiBubble, { paddingVertical: 12 }]}>
            <Text style={s5.bubbleText}>...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={s5.inputBar}>
        <TextInput
          style={s5.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your crops..."
          placeholderTextColor={Colors.textDisabled}
          multiline
          onSubmitEditing={() => send(input)}
        />
        <TouchableOpacity style={s5.sendBtn} onPress={() => send(input)} disabled={!input.trim() || busy}>
          <Text style={s5.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s5 = StyleSheet.create({
  header: {
    backgroundColor:'#6A1B9A', padding: Space.md, paddingTop: Space.sm,
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
  },
  headerTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
  onlineText: { fontSize: Font.size.caption, color:'rgba(255,255,255,0.8)' },
  quickBar: { backgroundColor: Colors.surface, borderBottomWidth:0.5, borderBottomColor: Colors.border, maxHeight:50 },
  quickBtn: { paddingHorizontal:12, paddingVertical:7, borderRadius:16, borderWidth:1.5, borderColor:'#CE93D8' },
  quickText: { fontSize: Font.size.caption, color:'#6A1B9A', fontWeight: Font.weight.medium },
  bubble: { maxWidth:'85%', borderRadius:16, padding:12 },
  aiBubble: { alignSelf:'flex-start', backgroundColor: Colors.surface, borderWidth:0.5, borderColor: Colors.border },
  userBubble: { alignSelf:'flex-end', backgroundColor: Colors.green },
  aiLabel: { fontSize:10, color:'#6A1B9A', fontWeight: Font.weight.bold, marginBottom:4 },
  bubbleText: { fontSize: Font.size.body, color: Colors.textPrimary, lineHeight:22 },
  userText: { color: Colors.textInverse },
  inputBar: {
    flexDirection:'row', alignItems:'flex-end', gap:10,
    padding:12, backgroundColor: Colors.surface,
    borderTopWidth:0.5, borderTopColor: Colors.border,
  },
  input: {
    flex:1, fontSize: Font.size.body, color: Colors.textPrimary,
    borderWidth:2, borderColor:'#CE93D8', borderRadius:20,
    paddingHorizontal:16, paddingVertical:10, maxHeight:100,
  },
  sendBtn: {
    width:48, height:48, borderRadius:24, backgroundColor:'#6A1B9A',
    alignItems:'center', justifyContent:'center',
  },
  sendText: { fontSize:20, color: Colors.textInverse, fontWeight: Font.weight.bold },
});

// ─────────────────────────────────────────────

/**
 * Notifications
 */
import { useAppSelector as useAS } from '@store/hooks';
import { selectNotifications } from '@store/slices/notificationSlice';

export function Notifications() {
  useAS(selectNotifications);

  const MOCK = [
    { id:'1', icon:'🚚', bg:'#FFF3E0', title:'Truck dispatched', msg:'Arriving in ~2 hours to collect your maize', ts:'2 hours ago', unread:true },
    { id:'2', icon:'📋', bg:'#E3F2FD', title:'New order placed', msg:'Warehouse ordered 500kg of your maize at UGX 1,500/kg', ts:'5 hours ago', unread:true },
    { id:'3', icon:'💰', bg:'#E8F5E9', title:'Payment received', msg:'UGX 150,000 sent to your MTN MoMo ✓', ts:'Yesterday, 3:22 PM', unread:false },
    { id:'4', icon:'⛅', bg:'#FFF9C4', title:'Weather alert', msg:'Heavy rain expected Friday. Protect your harvest.', ts:'Yesterday, 11:00 AM', unread:false },
    { id:'5', icon:'⭐', bg:'#FFF9C4', title:'5-star rating received!', msg:'Warehouse rated your Sweet Potato produce 5 stars', ts:'Apr 6', unread:false },
  ];

  return (
    <View style={{ flex:1, backgroundColor: Colors.bg }}>
      <View style={s6.header}>
        <Text style={s6.title}>Notifications</Text>
        <TouchableOpacity><Text style={s6.markAll}>Mark all read</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: Space.md, gap:2 }} showsVerticalScrollIndicator={false}>
        {MOCK.map((n, i) => (
          <View key={n.id}>
            {(i === 0 || (i === 2 && MOCK[0].ts !== MOCK[2].ts)) && (
              <Text style={s6.dayLabel}>{i === 0 ? 'TODAY' : 'YESTERDAY'}</Text>
            )}
            <TouchableOpacity style={[s6.row, n.unread && s6.rowUnread]}>
              {n.unread && <View style={s6.dot} />}
              <View style={[s6.iconWrap, { backgroundColor: n.bg }]}>
                <Text style={{ fontSize:22 }}>{n.icon}</Text>
              </View>
              <View style={{ flex:1, gap:3 }}>
                <Text style={s6.rowTitle}>{n.title}</Text>
                <Text style={s6.rowMsg} numberOfLines={2}>{n.msg}</Text>
                <Text style={s6.rowTs}>{n.ts}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s6 = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface, padding: Space.md,
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    borderBottomWidth:0.5, borderBottomColor: Colors.border,
  },
  title: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  markAll: { fontSize: Font.size.label, color: Colors.info, fontWeight: Font.weight.medium },
  dayLabel: {
    fontSize:10, fontWeight: Font.weight.bold, color: Colors.textMuted,
    letterSpacing:.06, paddingVertical:8, paddingHorizontal:4,
  },
  row: {
    flexDirection:'row', alignItems:'flex-start', gap:12,
    backgroundColor: Colors.surface, padding:14,
    borderBottomWidth:0.5, borderBottomColor: Colors.border,
  },
  rowUnread: { backgroundColor:'#F8FFF8' },
  dot: { width:8, height:8, borderRadius:4, backgroundColor: Colors.info, marginTop:6, flexShrink:0 },
  iconWrap: { width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center', flexShrink:0 },
  rowTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  rowMsg: { fontSize: Font.size.caption, color: Colors.textSecondary, lineHeight:18 },
  rowTs: { fontSize:11, color: Colors.textMuted },
});
