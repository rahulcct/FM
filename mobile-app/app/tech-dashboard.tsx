import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { getMyAssignments, getMyShifts, getMySubmissionHistoryWithFallback, getMyWarnings, getStoredUser, getTodayProgress, getWorkOrders, type Assignment, type Shift, type SubmissionHistoryItem } from '../utils/api';

type DashboardHistoryItem = {
    kind: 'checklist' | 'logsheet' | 'workorder';
    id: number;
    title: string;
    subtitle: string;
    status: string;
    at: string;
    type?: 'checklist' | 'logsheet';
};

// Reusable Navigation Bar Component for Tech Flow
export const TechBottomNav = ({ activeRoute }: { activeRoute: string }) => {
    return (
        <View style={navStyles.container}>
            <TouchableOpacity style={navStyles.navItem} onPress={() => router.push('/tech-dashboard')}>
                <View style={[navStyles.iconWrapper, activeRoute === 'home' && navStyles.iconWrapperActive]}>
                    <MaterialCommunityIcons
                        name={activeRoute === 'home' ? 'clipboard-list' : 'clipboard-list-outline'}
                        size={22}
                        color={activeRoute === 'home' ? '#6C5CE7' : '#94A3B8'}
                    />
                </View>
                <Text style={[navStyles.navText, activeRoute === 'home' && navStyles.navTextActive]}>Tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity style={navStyles.navItem} onPress={() => router.push('/tech-training' as any)}>
                <View style={[navStyles.iconWrapper, activeRoute === 'training' && navStyles.iconWrapperActive]}>
                    <MaterialCommunityIcons
                        name={activeRoute === 'training' ? 'school' : 'school-outline'}
                        size={22}
                        color={activeRoute === 'training' ? '#6C5CE7' : '#94A3B8'}
                    />
                </View>
                <Text style={[navStyles.navText, activeRoute === 'training' && navStyles.navTextActive]}>Training</Text>
            </TouchableOpacity>

            {/* QR Scanner center FAB */}
            <TouchableOpacity style={navStyles.qrBtn} activeOpacity={0.85} onPress={() => router.push('/qr-scanner' as any)}>
                <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={navStyles.navItem} onPress={() => router.push('/tech-work-orders' as any)}>
                <View style={[navStyles.iconWrapper, activeRoute === 'workorders' && navStyles.iconWrapperActive]}>
                    <MaterialCommunityIcons
                        name={activeRoute === 'workorders' ? 'wrench-clock' : 'wrench-clock-outline'}
                        size={22}
                        color={activeRoute === 'workorders' ? '#6C5CE7' : '#94A3B8'}
                    />
                </View>
                <Text style={[navStyles.navText, activeRoute === 'workorders' && navStyles.navTextActive]}>W.O.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={navStyles.navItem} onPress={() => router.push('/user-history' as any)}>
                <View style={[navStyles.iconWrapper, activeRoute === 'history' && navStyles.iconWrapperActive]}>
                    <MaterialCommunityIcons
                        name='history'
                        size={22}
                        color={activeRoute === 'history' ? '#6C5CE7' : '#94A3B8'}
                    />
                </View>
                <Text style={[navStyles.navText, activeRoute === 'history' && navStyles.navTextActive]}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={navStyles.navItem} onPress={() => router.push('/profile' as any)}>
                <View style={[navStyles.iconWrapper, activeRoute === 'profile' && navStyles.iconWrapperActive]}>
                    <MaterialCommunityIcons
                        name={activeRoute === 'profile' ? 'account' : 'account-outline'}
                        size={22}
                        color={activeRoute === 'profile' ? '#6C5CE7' : '#94A3B8'}
                    />
                </View>
                <Text style={[navStyles.navText, activeRoute === 'profile' && navStyles.navTextActive]}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const navStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        borderTopWidth: 1,
        borderTopColor: '#EDE9FE',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 12,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconWrapper: {
        padding: 6,
        borderRadius: 12,
    },
    iconWrapperActive: {
        backgroundColor: '#EDE9FE',
    },
    qrBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6C5CE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -32,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
        elevation: 10,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    navText: {
        fontSize: 10,
        color: '#94A3B8',
        marginTop: 3,
        fontWeight: '500',
    },
    navTextActive: {
        color: '#6C5CE7',
        fontWeight: '700',
    },
});

export default function TechDashboardScreen() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [todayProgress, setTodayProgress] = useState({ checklistsDone: 0, logsheetsDone: 0, totalDone: 0 });
    const [openWarningCount, setOpenWarningCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'Checklists' | 'Log Sheets' | 'History'>('Checklists');
    const [historyItems, setHistoryItems] = useState<SubmissionHistoryItem[]>([]);
    const [historyWorkOrders, setHistoryWorkOrders] = useState<any[]>([]);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'History' && !historyLoaded) {
            Promise.all([
                getMySubmissionHistoryWithFallback(40).catch(() => [] as SubmissionHistoryItem[]),
                getWorkOrders(40, true).catch(() => [] as any[]),
            ])
                .then(([submissionHistory, workOrdersHistory]) => {
                    setHistoryItems(submissionHistory);
                    setHistoryWorkOrders(workOrdersHistory);
                    setHistoryLoaded(true);
                })
                .catch(() => {});
        }
    }, [activeTab, historyLoaded]);

    const loadData = async () => {
        try {
            const [data, storedUser, myShifts, progress, warnings] = await Promise.all([
                getMyAssignments(),
                getStoredUser(),
                getMyShifts().catch(() => [] as Shift[]),
                getTodayProgress().catch(() => ({ checklistsDone: 0, logsheetsDone: 0, totalDone: 0 })),
                getMyWarnings(20).catch(() => []),
            ]);
            setAssignments(data);
            setUser(storedUser);
            setShifts(myShifts);
            setTodayProgress(progress);
            setOpenWarningCount(warnings.filter(w => w.status === 'open' || w.status === 'in_progress').length);
            // refresh history too
            const [submissionHistory, workOrdersHistory] = await Promise.all([
                getMySubmissionHistoryWithFallback(40).catch(() => [] as SubmissionHistoryItem[]),
                getWorkOrders(40, true).catch(() => [] as any[]),
            ]);
            setHistoryItems(submissionHistory);
            setHistoryWorkOrders(workOrdersHistory);
            setHistoryLoaded(true);
        } catch (error: any) {
            console.warn('Failed to load dashboard:', error instanceof Error ? error.message : error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => { setRefreshing(true); loadData(); };

    const total = assignments.length;
    const completed = todayProgress.totalDone;
    const totalForProgress = Math.max(total, completed, 1);
    const pct = Math.round((completed / totalForProgress) * 100);
    const progressRatio = Math.min(completed / totalForProgress, 1);

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    };

    const getPriorityConfig = (frequency?: string) => {
        const f = (frequency || '').toLowerCase();
        if (f === 'daily' || f === 'shift')
            return { label: 'High Priority', bg: '#FFF0ED', color: '#E05C2A', icon: 'alert' as const };
        if (f === 'weekly')
            return { label: 'Routine', bg: '#F1F5F9', color: '#64748B', icon: null };
        return { label: 'Routine', bg: '#F1F5F9', color: '#64748B', icon: null };
    };

    const getMotivation = () => {
        if (pct >= 80) return "Great job! You're ahead of schedule.";
        if (pct >= 50) return "Keep going, you're halfway there!";
        if (pct > 0) return "Good start! Keep up the momentum.";
        return "Let's get started on today's tasks!";
    };

    const historyTimeline: DashboardHistoryItem[] = [
        ...historyItems.map((item) => ({
            kind: item.type,
            id: item.id,
            title: item.templateName,
            subtitle: item.assetName ? `Asset: ${item.assetName}` : 'Submitted record',
            status: item.status || 'submitted',
            at: item.submittedAt,
            type: item.type,
        })),
        ...historyWorkOrders.map((wo) => ({
            kind: 'workorder' as const,
            id: Number(wo.id),
            title: wo.workOrderNumber || `WO-${wo.id}`,
            subtitle: wo.assetName || wo.issueDescription || 'Work order',
            status: wo.status || 'open',
            at: wo.updatedAt || wo.createdAt || wo.created_at || '',
        })),
    ].sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </SafeAreaView>
        );
    }

    const userName = user?.fullName || user?.fullname || 'Technician';

    return (
        <SafeAreaView style={styles.container}>
                    <Header title={`Good Morning, ${userName}`} subtitle="Your tasks for today" />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" colors={['#2563EB']} />}
            >
                {/* Progress card */}
                <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.progressCard}>
                    <View style={styles.progressTop}>
                        <View>
                            <Text style={styles.progressLabel}>Today&apos;s Progress</Text>
                            <Text style={styles.progressFraction}>
                                <Text style={styles.progressDone}>{completed}</Text>
                                <Text style={styles.progressTotal}> / {totalForProgress} Tasks</Text>
                            </Text>
                        </View>
                        <View style={styles.pctBadge}>
                            <Text style={styles.pctText}>{pct}%</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.max(progressRatio * 100, 4)}%` as any }]} />
                    </View>
                    <Text style={styles.motivationText}>{getMotivation()}</Text>
                </Animated.View>

                {/* Assigned Tasks header with tabs */}
                <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.assignedTitle}>My Tasks</Text>
                    </View>
                    <Button title="See All" onPress={() => router.push('/tech-tasks' as any)} variant="ghost" />
                </Animated.View>

                {/* Tab bar */}
                <Animated.View entering={FadeInUp.delay(120).duration(350)} style={styles.tabRow}>
                    {(['Checklists', 'Log Sheets', 'History'] as const).map(tab => {
                        const count = tab === 'Checklists'
                            ? assignments.filter(a => a.templateType === 'checklist').length
                            : tab === 'Log Sheets'
                            ? assignments.filter(a => a.templateType === 'logsheet').length
                            : historyTimeline.length;
                        return (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                                    {tab} {count > 0 && `(${count})`}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>

                {/* Active shift banner */}
                {shifts.length > 0 && (() => {
                    const fmt12 = (t: string) => {
                        const [h, m] = t.split(':');
                        const hr = parseInt(h, 10);
                        return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
                    };
                    const isActive = (s: Shift) => {
                        const now = new Date();
                        const nowMins = now.getHours() * 60 + now.getMinutes();
                        const [sh, sm] = s.startTime.split(':').map(Number);
                        const [eh, em] = s.endTime.split(':').map(Number);
                        const startMins = sh * 60 + sm;
                        const endMins = eh * 60 + em;
                        if (startMins <= endMins) return nowMins >= startMins && nowMins <= endMins;
                        return nowMins >= startMins || nowMins <= endMins;
                    };
                    const activeShift = shifts.find(isActive);
                    const currentShift = activeShift || shifts[0];
                    return (
                        <Animated.View entering={FadeInDown.delay(50).duration(350)} style={[shiftBannerStyles.container, activeShift ? shiftBannerStyles.active : shiftBannerStyles.inactive]}>
                            <View style={shiftBannerStyles.iconWrap}>
                                <MaterialCommunityIcons name="clock-outline" size={18} color={activeShift ? '#16a34a' : '#64748b'} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[shiftBannerStyles.name, !activeShift && { color: '#64748b' }]}>{currentShift.name}</Text>
                                <Text style={shiftBannerStyles.time}>{fmt12(currentShift.startTime)} – {fmt12(currentShift.endTime)}</Text>
                            </View>
                            {activeShift && (
                                <View style={shiftBannerStyles.activeBadge}>
                                    <Text style={shiftBannerStyles.activeBadgeText}>ACTIVE</Text>
                                </View>
                            )}
                        </Animated.View>
                    );
                })()}

                {/* Task cards or History list */}
                {(() => {
                    if (activeTab === 'History') {
                        if (historyTimeline.length === 0) {
                            return (
                                <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.emptyBox}>
                                    <MaterialCommunityIcons name="history" size={36} color="#CBD5E1" />
                                    <Text style={styles.emptyTitle}>No history yet</Text>
                                    <Text style={styles.emptyText}>Recent submitted checklists, logsheets, and work orders will appear here.</Text>
                                </Animated.View>
                            );
                        }
                        return historyTimeline.slice(0, 12).map((item, i) => (
                            <Animated.View key={`hist-${item.kind}-${item.id}`} entering={FadeInUp.delay(80 + i * 40).duration(350)}>
                                <TouchableOpacity
                                    style={styles.histCard}
                                    activeOpacity={0.75}
                                    onPress={() => {
                                        if (item.kind === 'workorder') {
                                            router.push({ pathname: '/work-order-details', params: { id: String(item.id) } } as any);
                                            return;
                                        }
                                        if (!item.type) {
                                            Alert.alert('History', 'Unable to open this history item.');
                                            return;
                                        }
                                        router.push({ pathname: '/tech-history-detail', params: { type: item.type, id: item.id, name: item.title } } as any);
                                    }}
                                >
                                    <View style={[styles.histIcon, {
                                        backgroundColor:
                                            item.kind === 'checklist' ? '#EEF2FF'
                                            : item.kind === 'logsheet' ? '#EFF6FF'
                                            : '#ECFEFF',
                                    }]}>
                                        <MaterialCommunityIcons
                                            name={
                                                item.kind === 'checklist' ? 'clipboard-check'
                                                : item.kind === 'logsheet' ? 'notebook'
                                                : 'wrench-clock-outline'
                                            }
                                            size={18}
                                            color={
                                                item.kind === 'checklist' ? '#6366F1'
                                                : item.kind === 'logsheet' ? '#2563EB'
                                                : '#0F766E'
                                            }
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.histName} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.histDate}>
                                            {item.at
                                                ? new Date(item.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : 'No date'}
                                            {item.subtitle ? ` · ${item.subtitle}` : ''}
                                        </Text>
                                    </View>
                                    <View style={[styles.histStatus, { backgroundColor: (item.status === 'completed' || item.status === 'closed' || item.status === 'submitted') ? '#ECFDF5' : '#FFF7ED' }]}>
                                        <Text style={[styles.histStatusTxt, { color: (item.status === 'completed' || item.status === 'closed' || item.status === 'submitted') ? '#10B981' : '#F59E0B' }]}>
                                            {(item.status === 'completed' || item.status === 'closed' || item.status === 'submitted') ? 'Done' : 'Recent'}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={16} color="#CBD5E1" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </Animated.View>
                        ));
                    }

                    const filteredAssignments = assignments.filter(a =>
                        activeTab === 'Checklists' ? a.templateType === 'checklist' : a.templateType === 'logsheet'
                    );

                    if (filteredAssignments.length === 0) {
                        return (
                            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.emptyBox}>
                                <View style={styles.emptyIconCircle}>
                                    <MaterialCommunityIcons name="check-all" size={32} color="#10B981" />
                                </View>
                                <Text style={styles.emptyTitle}>You&apos;re all caught up!</Text>
                                <Text style={styles.emptyText}>No pending {activeTab.toLowerCase()} for now.</Text>
                            </Animated.View>
                        );
                    }

                    return filteredAssignments.slice(0, 10).map((a, idx) => {
                        const pc = getPriorityConfig(a.frequency || '');
                        const isFirst = idx === 0;
                        const initials = getInitials(userName);
                        return (
                            <Animated.View key={a.assignmentId ?? idx} entering={FadeInUp.delay(100 + idx * 50).duration(400).springify()}>
                                <TouchableOpacity
                                    style={[styles.taskCard, isFirst && styles.taskCardHighlight]}
                                    activeOpacity={0.7}
                                    onPress={() => router.push({ pathname: '/tech-execution', params: { assignmentId: String(a.assignmentId), templateType: a.templateType, templateId: String(a.templateId), templateName: a.templateName, assetId: a.assetId ? String(a.assetId) : '', assetName: a.assetName || '' } } as any)}
                                >
                                    {isFirst && <View style={styles.cardIndicator} />}
                                    <View style={styles.taskContent}>
                                        <View style={styles.taskTopRow}>
                                            <View style={[styles.priorityBadge, { backgroundColor: isFirst ? '#FEE2E2' : '#F1F5F9' }]}>
                                                {pc.icon && <MaterialCommunityIcons name={isFirst ? 'alert-circle' : 'circle-medium'} size={12} color={isFirst ? '#DC2626' : '#64748B'} />}
                                                <Text style={[styles.priorityText, { color: isFirst ? '#DC2626' : '#64748B' }]}>{isFirst ? 'High Priority' : 'Standard'}</Text>
                                            </View>
                                            <Text style={styles.dueText}>Due {idx === 0 ? '10:00 AM' : idx === 1 ? '1:30 PM' : 'End of Shift'}</Text>
                                        </View>

                                        <Text style={styles.taskName}>{a.templateName}</Text>

                                        <View style={styles.taskLocRow}>
                                            <MaterialCommunityIcons name="office-building" size={14} color="#94A3B8" />
                                            <Text style={styles.taskLoc}>{a.assetType || a.assetName || 'General Facility'}</Text>
                                        </View>

                                        <View style={styles.taskBottom}>
                                            <View style={styles.avatarCircle}>
                                                <Text style={styles.avatarText}>{initials}</Text>
                                            </View>
                                            <View
                                                style={[styles.startBtn, isFirst ? styles.startBtnSolid : styles.startBtnOutline]}
                                            >
                                                <Text style={[styles.startBtnText, !isFirst && styles.startBtnTextOutline]}>
                                                    Start Task
                                                </Text>
                                                <MaterialCommunityIcons name="arrow-right" size={16} color={isFirst ? '#FFFFFF' : '#6C5CE7'} style={{ marginLeft: 4 }} />
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    });
                })()}

                <View style={{ height: 30 }} />
            </ScrollView>

            <TechBottomNav activeRoute="home" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F3FF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    scroll: { padding: 20, paddingTop: 4 },

    // Progress card - vibrant purple gradient effect
    progressCard: {
        backgroundColor: '#6C5CE7',
        borderRadius: 22,
        padding: 22,
        marginBottom: 24,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
        elevation: 8,
    },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
    progressLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    progressFraction: { flexDirection: 'row', alignItems: 'baseline' },
    progressDone: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
    progressTotal: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
    pctBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 7,
    },
    pctText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
    progressBarBg: {
        height: 7, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, marginBottom: 12, overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4,
    },
    motivationText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    // Section row
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    assignedTitle: { fontSize: 18, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.3 },
    viewAll: { fontSize: 14, fontWeight: '600', color: '#6C5CE7' },

    // Tabs
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#EDE9FE',
        borderRadius: 14,
        padding: 4,
        marginBottom: 14,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 11,
        alignItems: 'center',
    },
    tabBtnActive: {
        backgroundColor: '#6C5CE7',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    tabBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7C6FB0',
    },
    tabBtnTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },

    // History cards (compact)
    histCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EDE9FE',
        gap: 10,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    histIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    histName: {
        fontSize: 13.5,
        fontWeight: '700',
        color: '#1E1B4B',
    },
    histDate: {
        fontSize: 11.5,
        color: '#94A3B8',
        marginTop: 2,
    },
    histStatus: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    histStatusTxt: {
        fontSize: 11,
        fontWeight: '700',
    },

    // Task card
    taskCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        marginBottom: 14,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EDE9FE',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    taskCardHighlight: {
        shadowOpacity: 0.12,
        shadowRadius: 16,
        borderColor: '#DDD6FE',
    },
    cardIndicator: {
        width: 5,
        backgroundColor: '#6C5CE7',
    },
    taskContent: {
        flex: 1,
        padding: 16,
    },
    taskTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    priorityBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7,
    },
    priorityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    dueText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    taskName: { fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginBottom: 8, letterSpacing: -0.2 },
    taskLocRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    taskLoc: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    taskBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F3FF', paddingTop: 12 },
    avatarCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#DDD6FE',
    },
    avatarText: { fontSize: 11, fontWeight: '800', color: '#6C5CE7' },
    startBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    },
    startBtnSolid: { backgroundColor: '#6C5CE7' },
    startBtnOutline: { backgroundColor: '#EDE9FE' },
    startBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
    startBtnTextOutline: { color: '#6C5CE7' },

    emptyBox: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1.5, borderColor: '#EDE9FE', borderStyle: 'dashed' },
    emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
    emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 24 },
});

const shiftBannerStyles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1.5 },
    active: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
    inactive: { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' },
    iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
    name: { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 1 },
    time: { fontSize: 12, color: '#10B981', fontWeight: '600' },
    activeBadge: { backgroundColor: '#D1FAE5', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
    activeBadgeText: { fontSize: 11, fontWeight: '800', color: '#059669' },
});
