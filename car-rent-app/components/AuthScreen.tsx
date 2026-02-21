import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Alert } from 'react-native';
import {router} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loginUser, registerUser } from '../src/api/auth';
import { setToken } from '../src/storage/token';

import { LoginResponse } from '../src/api/auth';


export default function AuthScreen() {

    const [isSignIn, setIsSignIn] = useState(true);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // API states
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const switchMode = (signInMode: boolean) => {
        setIsSignIn(signInMode);
        setErrorMsg(null); // clear errors when switching
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMsg("Please fill in email and password.");
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        try {
            const response: any = await loginUser({ email, password });
            console.log("Login response:", response);

            // Extract token from the data wrapper
            const receivedToken = response?.data?.token || response?.token;

            if (!receivedToken) {
                setErrorMsg("Server did not return a valid token.");
                return;
            }
            console.log("Token received:", receivedToken);  
            await setToken(receivedToken);
            console.log("Token stored successfully");
            Alert.alert("Success", "You are logged in successfully!");
            router.push('/some');
            // In a real app we would navigate away to main screens here
        } catch (err: any) {
            setErrorMsg(err.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setErrorMsg("Please fill in all required fields (*).");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }
        if (!acceptTerms) {
            setErrorMsg("You must accept the terms and conditions.");
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        try {
            const ageNumber = age ? parseInt(age, 10) : 0;
            await registerUser({
                firstName,
                lastName,
                email,
                password,
                phoneNumber: phone,
                age: isNaN(ageNumber) ? 0 : ageNumber,
                userType: 2 // Default user type
            });
            Alert.alert("Success", "Account created! You can now sign in.");
            switchMode(true); // switch to sign in
        } catch (err: any) {
            setErrorMsg(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Segmented Toggle */}
                    <View style={styles.toggleContainer}>
                        <Pressable
                            style={[styles.toggleBtn, isSignIn && styles.activeToggleBtn]}
                            onPress={() => switchMode(true)}
                            disabled={isLoading}
                        >
                            <Text style={[styles.toggleText, isSignIn && styles.activeToggleText]}>
                                Sign In
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.toggleBtn, !isSignIn && styles.activeToggleBtn]}
                            onPress={() => switchMode(false)}
                            disabled={isLoading}
                        >
                            <Text style={[styles.toggleText, !isSignIn && styles.activeToggleText]}>
                                Sign Up
                            </Text>
                        </Pressable>
                    </View>

                    {/* Lock Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed" size={50} color="#BB4D00" />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>
                        {isSignIn ? 'Welcome Back' : 'Create Account'}
                    </Text>

                    {/* Form Fields container */}
                    <View style={styles.formContainer}>
                        {/* Error Message Space */}
                        {errorMsg ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        ) : null}

                        {isSignIn ? (
                            // --- SIGN IN FORM ---
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#B0A89C"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#B0A89C"
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.buttonContainer}>
                                    <Pressable
                                        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                                        onPress={handleLogin}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.primaryButtonText}>Sign In</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            // --- SIGN UP FORM ---
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>First Name <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter first name"
                                        placeholderTextColor="#B0A89C"
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Last Name <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter last name"
                                        placeholderTextColor="#B0A89C"
                                        value={lastName}
                                        onChangeText={setLastName}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#B0A89C"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter phone number"
                                        placeholderTextColor="#B0A89C"
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Age</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter age"
                                        placeholderTextColor="#B0A89C"
                                        keyboardType="number-pad"
                                        value={age}
                                        onChangeText={setAge}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter password (min. 6 characters)"
                                        placeholderTextColor="#B0A89C"
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm Password <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm your password"
                                        placeholderTextColor="#B0A89C"
                                        secureTextEntry
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Terms and conditions checkbox */}
                                <View style={styles.termsRow}>
                                    <Pressable
                                        style={[styles.checkbox, acceptTerms && styles.checkboxActive]}
                                        onPress={() => !isLoading && setAcceptTerms(!acceptTerms)}
                                        disabled={isLoading}
                                    >
                                        {acceptTerms && <View style={styles.checkboxInner} />}
                                    </Pressable>
                                    <Text style={styles.termsText}>
                                        I agree to the terms and conditions <Text style={styles.asterisk}>*</Text>
                                    </Text>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <Pressable
                                        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                                        onPress={handleRegister}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.primaryButtonText}>Create Account</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F2EA', // Soft cream background
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    // Toggle Styles
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 4,
        width: '100%',
        maxWidth: 400,
        marginBottom: 70,
        borderWidth: 1,
        borderColor: '#E8DCCB',
        // Subtle shadow for the toggle container itself
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeToggleBtn: {
        backgroundColor: '#B35A12', // Primary warm brown
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#B35A12',
    },
    activeToggleText: {
        color: '#FFFFFF',
    },
    // Header / Title styles
    iconContainer: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockIcon: {
        width: 32,
        height: 32,
        tintColor: '#B35A12', // Optional if PNG is a mask
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 32,
        textAlign: 'center',
    },
    // Form Styles
    formContainer: {
        width: '100%',
        maxWidth: 400,
    },
    errorContainer: {
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#FDECEA', // Light red background
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F1A9A0',
    },
    errorText: {
        color: '#CF000F',
        fontSize: 14,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8C4004', // Brown-ish slightly darker
        marginBottom: 8,
        marginLeft: 2,
    },
    asterisk: {
        color: '#B35A12',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F2C27A', // Warm light gold
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        fontSize: 15,
        color: '#1A1A1A',
        // Subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    // Checkbox row
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1.5,
        borderColor: '#B35A12',
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxActive: {
        backgroundColor: '#B35A12',
    },
    checkboxInner: {
        width: 10,
        height: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    termsText: {
        fontSize: 14,
        color: '#8C4004',
        fontWeight: '500',
    },
    // Button Styles
    buttonContainer: {
        marginTop: 16,
    },
    primaryButton: {
        backgroundColor: '#B35A12',
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#B35A12',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonDisabled: {
        backgroundColor: '#B35A12AA', // Slightly transparent brown
        shadowOpacity: 0.1,
        elevation: 1,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
