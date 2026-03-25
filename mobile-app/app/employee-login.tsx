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
import { loginEmployee, getStoredCompany } from '../utils/api';

export default function EmployeeLoginScreen() {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);
    const [companyName, setCompanyName] = useState('');
    const [companyId, setCompanyId] = useState<number | null>(null);

    useEffect(() => {
        loadCompanyData();
    }, []);

    const loadCompanyData = async () => {
        console.log('Loading company data...');
        setIsLoadingCompany(true);
        const company = await getStoredCompany();
        console.log('Stored company:', company);
        
        if (!company) {
            // No company data, go back to company code screen
            Alert.alert('Error', 'Please enter company code first');
            router.replace('/');
            return;
        }
        
        console.log('Setting company name:', company.companyName);
        console.log('Setting company ID:', company.companyId);
        setCompanyName(company.companyName);
        setCompanyId(company.companyId);
        setIsLoadingCompany(false);
    };

    const handleLogin = async () => {
        // Validation
        if (!employeeId.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both username and password');
            return;
        }

        if (!companyId || companyId === null) {
            Alert.alert('Error', 'Company information missing. Please restart the app.');
            console.error('CompanyId is null or undefined:', companyId);
            router.replace('/');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Attempting login with username:', employeeId.trim());
            console.log('Company ID:', companyId);
            console.log('Company name:', companyName);
            
            // Call authentication API with company ID (companyId is guaranteed to be number here)
            const response = await loginEmployee(employeeId.trim(), password, companyId as number);
            
            console.log('Login successful, user:', response.user);
            console.log('User role:', response.user.role);
            
            // Don't reset loading here - let the navigation happen with loading state
            // Route based on user role (case-insensitive)
            const userRole = response.user.role?.toLowerCase();
            if (userRole === 'supervisor') {
                console.log('Routing to supervisor-dashboard');
                router.replace('/supervisor-dashboard');
            } else if (userRole === 'technician') {
                console.log('Routing to tech-dashboard (technician)');
                router.replace('/tech-dashboard');
            } else {
                console.log('Routing to dashboard (general employee)');
                router.replace('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Login failed. Please try again.';
            
            Alert.alert('Login Failed', errorMessage);
        } finally {
            // Always reset loading state
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <View style={styles.backBtnCircle}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
                </View>
            </TouchableOpacity>

            {/* Hero Section */}
            <View style={styles.heroSection}>
                <View style={styles.logoBadge}>
                    <MaterialCommunityIcons name="shield-account" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.appName}>Welcome Back</Text>
                <Text style={styles.companyName}>{companyName || 'Loading company...'}</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Sign In</Text>
                    <Text style={styles.formSubtitle}>Enter your employee credentials</Text>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconBox}>
                                <MaterialCommunityIcons name="account-outline" size={18} color="#6C5CE7" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Employee username"
                                placeholderTextColor="#A0AEC0"
                                value={employeeId}
                                onChangeText={setEmployeeId}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconBox}>
                                <MaterialCommunityIcons name="lock-outline" size={18} color="#6C5CE7" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter password"
                                placeholderTextColor="#A0AEC0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading} style={styles.eyeBtn}>
                                <MaterialCommunityIcons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#6C5CE7"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, (isLoading || isLoadingCompany) && styles.buttonDisabled]}
                        activeOpacity={0.82}
                        onPress={handleLogin}
                        disabled={isLoading || isLoadingCompany}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : isLoadingCompany ? (
                            <Text style={styles.buttonText}>Loading...</Text>
                        ) : (
                            <>
                                <MaterialCommunityIcons name="login" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Sign In</Text>
                            </>
                        )}
                    </TouchableOpacity>
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
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 36,
        left: 20,
        zIndex: 10,
    },
    backBtnCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 60 : 40,
        paddingBottom: 24,
        minHeight: 220,
    },
    logoBadge: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: '#6C5CE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 18,
        elevation: 10,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.22)',
    },
    appName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
        marginBottom: 6,
    },
    companyName: {
        fontSize: 14,
        color: '#A78BFA',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    keyboardView: {
        flexShrink: 1,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 34,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
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
        marginBottom: 4,
        letterSpacing: -0.4,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 28,
        fontWeight: '500',
    },
    inputSection: {
        marginBottom: 18,
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
        gap: 10,
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
        fontSize: 15,
        color: '#1E1B4B',
        fontWeight: '500',
    },
    eyeBtn: {
        padding: 4,
    },
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
});
