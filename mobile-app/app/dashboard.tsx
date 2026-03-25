import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Define the grid items with vibrant colors
const DASHBOARD_ITEMS = [
    { id: '1', title: 'Assets', icon: 'office-building', color: '#6C5CE7', bg: '#EDE9FE', iconType: 'MaterialCommunityIcons', route: '/assets-list' },
    { id: '2', title: 'Warnings', icon: 'bell-outline', color: '#EF4444', bg: '#FEE2E2', iconType: 'MaterialCommunityIcons', route: '/warnings' },
    { id: '3', title: 'Checklists', icon: 'check-all', color: '#10B981', bg: '#D1FAE5', iconType: 'MaterialCommunityIcons', route: '/checklists' },
    { id: '4', title: 'Work Orders', icon: 'card-account-details-outline', color: '#3B82F6', bg: '#DBEAFE', iconType: 'MaterialCommunityIcons', route: null },
    { id: '5', title: 'Log Sheets', icon: 'calendar-blank-outline', color: '#0891B2', bg: '#E0F2FE', iconType: 'MaterialCommunityIcons', route: null },
    { id: '6', title: 'Training', icon: 'school-outline', color: '#F59E0B', bg: '#FEF3C7', iconType: 'Ionicons', route: '/ojt-training-list' },
];

export default function DashboardScreen() {

    const renderItem = ({ item }: { item: typeof DASHBOARD_ITEMS[0] }) => (
        <TouchableOpacity
            style={[styles.gridItem, { borderTopColor: item.color }]}
            activeOpacity={0.75}
            onPress={() => {
                if (item.route) router.push(item.route as any);
            }}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                {item.iconType === 'Ionicons' ? (
                    <Ionicons name={item.icon as any} size={26} color={item.color} />
                ) : (
                    <MaterialCommunityIcons name={item.icon as any} size={26} color={item.color} />
                )}
            </View>
            <Text style={styles.gridItemText}>{item.title}</Text>
            <MaterialCommunityIcons name="arrow-right" size={14} color="#CBD5E1" style={{ marginTop: 4 }} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <Text style={styles.welcomeText}>Good Day</Text>
                    <Text style={styles.headerTitle}>FM Dashboard</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MaterialCommunityIcons name="bell-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/profile')}>
                        <Text style={styles.avatarText}>U</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Catalyst badge */}
            <View style={styles.brandBanner}>
                <View style={styles.brandIcon}>
                    <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.brandTitle}>CATALYST FM</Text>
                    <Text style={styles.brandSub}>Facility Management System</Text>
                </View>
                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
            </View>

            {/* Section label */}
            <Text style={styles.sectionLabel}>QUICK ACCESS</Text>

            {/* Grid of Options */}
            <FlatList
                data={DASHBOARD_ITEMS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3FF',
    },

    // Header
    headerContainer: {
        backgroundColor: '#1E1B4B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 44 : 16,
        paddingBottom: 18,
    },
    headerLeft: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 12,
        color: '#A78BFA',
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6C5CE7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },

    // Brand Banner
    brandBanner: {
        backgroundColor: '#6C5CE7',
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 6,
        borderRadius: 16,
        padding: 14,
        gap: 12,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    brandIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    brandSub: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 1,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        gap: 5,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4ADE80',
    },
    liveText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: 1,
    },

    // Section label
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginHorizontal: 24,
        marginTop: 20,
        marginBottom: 12,
    },

    // Grid
    gridContainer: {
        paddingHorizontal: 12,
        paddingBottom: 24,
    },
    row: {
        flex: 1,
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gridItem: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        marginHorizontal: 6,
        borderRadius: 18,
        paddingVertical: 22,
        paddingHorizontal: 14,
        alignItems: 'center',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        borderTopWidth: 3,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    gridItemText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E1B4B',
    },
});
