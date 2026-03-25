import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { verifyToken, verifyCompanyCode } from '../utils/api';

export default function LoginScreen() {
    const [companyCode, setCompanyCode] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);

    // Auto-login: Check for stored token on mount
    useEffect(() => {
        checkStoredAuth();
    }, []);

    const checkStoredAuth = async () => {
        try {
            const result = await verifyToken();
            
            if (result && result.user) {
                // Valid token found, navigate to appropriate dashboard
                const role = result.user.role?.toLowerCase();
                if (role === 'supervisor') {
                    router.replace('/supervisor-dashboard');
                } else if (role === 'technician') {
                    router.replace('/tech-dashboard');
                } else {
                    router.replace('/dashboard');
                }
            } else {
                // No stored token, stay on login page
                console.log('No stored authentication found');
            }
        } catch (error) {
            // Error checking stored auth, silently continue to login page
            console.log('Auth check failed (expected on first launch):', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setIsCheckingAuth(false);
        }
    };

    // Show loading screen while checking auth
    if (isCheckingAuth) {
        return (
            <View style={styles.container}>
                <View style={styles.heroSection}>
                    <View style={styles.logoBadge}>
                        <MaterialCommunityIcons name="lightning-bolt" size={34} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appName}>C A T A L Y S T</Text>
                    <Text style={styles.appTagline}>Facility Management System</Text>
                </View>
                <View style={[styles.formCard, { justifyContent: 'center', alignItems: 'center', paddingVertical: 56 }]}>
                    <ActivityIndicator size="large" color="#6C5CE7" />
                    <Text style={[styles.formSubtitle, { marginTop: 16 }]}>Signing you in...</Text>
                </View>
            </View>
        );
    }

    const handleVerifyCompany = async () => {
        if (!companyCode.trim()) {
            Alert.alert('Error', 'Please enter your company code');
            return;
        }

        setIsVerifying(true);

        try {
            await verifyCompanyCode(companyCode.trim());
            // Navigate to employee login after successful verification
            router.push('/employee-login');
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Company verification failed. Please try again.';
            
            Alert.alert('Verification Failed', errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Hero / Brand Section */}
                <View style={styles.heroSection}>
                    <View style={styles.logoBadge}>
                        <MaterialCommunityIcons name="lightning-bolt" size={34} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appName}>C A T A L Y S T</Text>
                    <Text style={styles.appTagline}>Facility Management System</Text>
                    <View style={styles.subtitleRow}>
                        <View style={styles.subtitleDot} />
                        <Text style={styles.subtitleText}>Smart · Fast · Reliable</Text>
                        <View style={styles.subtitleDot} />
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Get Started</Text>
                    <Text style={styles.formSubtitle}>Enter your company code to continue</Text>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Company Code</Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconBox}>
                                <MaterialCommunityIcons name="office-building" size={18} color="#6C5CE7" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. ACME2024"
                                placeholderTextColor="#A0AEC0"
                                value={companyCode}
                                onChangeText={setCompanyCode}
                                autoCapitalize="characters"
                                editable={!isVerifying}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isVerifying && styles.buttonDisabled]}
                        activeOpacity={0.82}
                        onPress={handleVerifyCompany}
                        disabled={isVerifying}
                    >
                        {isVerifying ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Continue</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.footerNote}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.footerLink}>Terms of Service</Text>
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1B4B',
    },
    keyboardView: {
        flex: 1,
    },

    // Hero branding section (top purple area)
    heroSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 32,
    },
    logoBadge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#6C5CE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    appName: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 5,
        marginBottom: 6,
    },
    appTagline: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1,
        marginBottom: 16,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subtitleDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#A78BFA',
    },
    subtitleText: {
        fontSize: 12,
        color: '#A78BFA',
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Form Card (white section at bottom)
    formCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 36,
        paddingBottom: Platform.OS === 'ios' ? 40 : 32,
        shadowColor: '#1E1B4B',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 16,
    },
    formTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1E1B4B',
        marginBottom: 6,
        letterSpacing: -0.4,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 28,
        fontWeight: '500',
    },

    // Input
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F3FF',
        borderWidth: 1.5,
        borderColor: '#DDD6FE',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 56,
        gap: 12,
    },
    inputIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E1B4B',
        fontWeight: '500',
    },

    // Button
    button: {
        backgroundColor: '#6C5CE7',
        borderRadius: 16,
        height: 58,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
        shadowOpacity: 0.1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Footer
    footerNote: {
        textAlign: 'center',
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 20,
    },
    footerLink: {
        color: '#6C5CE7',
        fontWeight: '600',
    },
});
