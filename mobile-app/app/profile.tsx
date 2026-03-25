import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { clearAuth, getStoredUser, getStoredCompany } from '../utils/api';
import { SupervisorBottomNav } from './supervisor-dashboard';
import { TechBottomNav } from './tech-dashboard';

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [pushNotif, setPushNotif] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await getStoredUser();
            const companyData = await getStoredCompany();
            setUser(userData);
            setCompany(companyData);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    setIsLoggingOut(true);
                    try {
                        await clearAuth();
                        router.replace('/');
                    } catch (error) {
                        Alert.alert('Error', 'Failed to logout. Please try again.');
                        setIsLoggingOut(false);
                    }
                },
            },
        ]);
    };

    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const formatRole = (role: string) => {
        if (!role) return 'EMPLOYEE';
        return role.replace(/_/g, ' ').toUpperCase();
    };

    const employeeId = user ? `FM-${String(user.id || '0000').padStart(4, '0')}` : 'FM-0000';

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6C5CE7" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitials}>{getInitials(user?.fullName || user?.fullname || 'User')}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <MaterialCommunityIcons name="pencil" size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.fullName || user?.fullname || 'User'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{formatRole(user?.role)}</Text>
                    </View>
                    {company?.companyName && (
                        <View style={styles.companyRow}>
                            <MaterialCommunityIcons name="office-building-outline" size={14} color="#A5B4FC" />
                            <Text style={styles.companyName}>{company.companyName.toUpperCase()}</Text>
                        </View>
                    )}
                    <Text style={styles.employeeId}>{employeeId}</Text>
                </View>

                <View style={styles.cardsArea}>
                    {/* Account Settings */}
                    <View style={styles.sectionGroup}>
                        <Text style={styles.sectionLabel}>ACCOUNT</Text>
                        <View style={styles.sectionCard}>
                            <SettingRow icon="email-outline" label="Email" value={user?.email} iconColor="#6C5CE7" iconBg="#EDE9FE" hasArrow />
                            <View style={styles.divider} />
                            <SettingRow icon="phone-outline" label="Phone" value={user?.phone} iconColor="#0891B2" iconBg="#E0F2FE" hasArrow />
                            <View style={styles.divider} />
                            <SettingRow icon="lock-outline" label="Change Password" subtitle="Update your security credentials" iconColor="#059669" iconBg="#D1FAE5" hasArrow />
                        </View>
                    </View>

                    {/* App Preferences */}
                    <View style={styles.sectionGroup}>
                        <Text style={styles.sectionLabel}>PREFERENCES</Text>
                        <View style={styles.sectionCard}>
                            <View style={styles.settingRow}>
                                <View style={[styles.settingIconBox, { backgroundColor: '#EDE9FE' }]}>
                                    <MaterialCommunityIcons name="bell-outline" size={18} color="#6C5CE7" />
                                </View>
                                <View style={styles.settingText}>
                                    <Text style={styles.settingLabel}>Push Notifications</Text>
                                    <Text style={styles.settingSubtitle}>Task alerts and system updates</Text>
                                </View>
                                <Switch
                                    value={pushNotif}
                                    onValueChange={setPushNotif}
                                    trackColor={{ false: '#E2E8F0', true: '#6C5CE7' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.settingRow}>
                                <View style={[styles.settingIconBox, { backgroundColor: '#FEF3C7' }]}>
                                    <MaterialCommunityIcons name="weather-night" size={18} color="#D97706" />
                                </View>
                                <View style={styles.settingText}>
                                    <Text style={styles.settingLabel}>Dark Mode</Text>
                                    <Text style={styles.settingSubtitle}>Adjust app appearance</Text>
                                </View>
                                <Switch
                                    value={darkMode}
                                    onValueChange={setDarkMode}
                                    trackColor={{ false: '#E2E8F0', true: '#6C5CE7' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Support */}
                    <View style={styles.sectionGroup}>
                        <Text style={styles.sectionLabel}>SUPPORT</Text>
                        <View style={styles.sectionCard}>
                            <SettingRow icon="help-circle-outline" label="Help Center" subtitle="Guides and FAQ" iconColor="#F97316" iconBg="#FFF7ED" isExternal />
                            <View style={styles.divider} />
                            <SettingRow icon="headset" label="Contact Us" subtitle="Get technical assistance" iconColor="#10B981" iconBg="#D1FAE5" hasArrow />
                        </View>
                    </View>

                    {/* Logout */}
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                        activeOpacity={0.8}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
                                <Text style={styles.logoutText}>Sign Out</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.version}>CATALYST FM • Version 2.4.0</Text>
                    <View style={{ height: 20 }} />
                </View>
            </ScrollView>

            {user?.role === 'technician' || user?.role === 'tech' ? (
                <TechBottomNav activeRoute="profile" />
            ) : (
                <SupervisorBottomNav activeRoute="profile" />
            )}
        </SafeAreaView>
    );
}

function SettingRow({
    icon, label, value, subtitle, hasArrow, isExternal, iconColor, iconBg,
}: {
    icon: string; label: string; value?: string; subtitle?: string; hasArrow?: boolean; isExternal?: boolean; iconColor?: string; iconBg?: string;
}) {
    return (
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={[styles.settingIconBox, { backgroundColor: iconBg || '#EDE9FE' }]}>
                <MaterialCommunityIcons name={icon as any} size={18} color={iconColor || '#6C5CE7'} />
            </View>
            <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{label}</Text>
                {value ? <Text style={styles.settingValue}>{value}</Text> : null}
                {subtitle && !value ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
            </View>
            {hasArrow && <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E0" />}
            {isExternal && <MaterialCommunityIcons name="open-in-new" size={18} color="#CBD5E0" />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F3FF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 48 : 16,
        paddingBottom: 16,
        backgroundColor: '#1E1B4B',
    },
    headerBtn: { padding: 4, width: 36 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },

    scroll: { paddingBottom: 24 },

    // Avatar
    avatarSection: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 28,
        backgroundColor: '#1E1B4B',
    },
    avatarWrap: { position: 'relative', marginBottom: 16 },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#6C5CE7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    avatarInitials: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E1B4B',
    },
    userName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 },
    roleBadge: {
        backgroundColor: 'rgba(108,92,231,0.3)',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(161,140,255,0.4)',
        marginBottom: 10,
    },
    roleBadgeText: { fontSize: 12, fontWeight: '800', color: '#C4B5FD', letterSpacing: 0.8 },
    companyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    companyName: { fontSize: 12, fontWeight: '600', color: '#A5B4FC', letterSpacing: 0.3 },
    employeeId: { fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },

    cardsArea: { paddingTop: 4 },

    // Sections
    sectionGroup: { marginTop: 20, paddingHorizontal: 16 },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6C5CE7',
        letterSpacing: 1.2,
        marginBottom: 10,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EDE9FE',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    divider: { height: 1, backgroundColor: '#F5F3FF', marginLeft: 64 },

    // Row
    settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    settingIconBox: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    settingText: { flex: 1 },
    settingLabel: { fontSize: 15, fontWeight: '600', color: '#1E1B4B' },
    settingValue: { fontSize: 13, color: '#64748B', marginTop: 1 },
    settingSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 1 },

    // Logout
    logoutBtn: {
        marginHorizontal: 16,
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    logoutText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },

    version: { textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 20, letterSpacing: 0.5 },
});
