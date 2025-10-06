import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    isPassword = false,
    style,
    ...props
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const getBorderColor = () => {
        if (error) return theme.colors.error;
        if (isFocused) return theme.colors.primary;
        return theme.colors.border;
    };

    const getBackgroundColor = () => {
        if (theme.isDark) {
            return isFocused ? '#1f1f1f' : theme.colors.surface;
        }
        return isFocused ? '#fafafa' : theme.colors.surface;
    };

    return (
        <View style={styles.container}>
            {label && (
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: getBackgroundColor(),
                        borderColor: getBorderColor(),
                        borderWidth: isFocused ? 1.5 : 0.5,
                    },
                ]}
            >
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        { color: theme.colors.text },
                        leftIcon ? styles.inputWithLeftIcon : null,
                        (rightIcon || isPassword) ? styles.inputWithRightIcon : null,
                        style,
                    ]}
                    placeholderTextColor={theme.colors.textSecondary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}

                {!isPassword && rightIcon && (
                    <View style={styles.rightIcon}>{rightIcon}</View>
                )}
            </View>

            {error && (
                <View style={styles.messageContainer}>
                    <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        {error}
                    </Text>
                </View>
            )}

            {!error && helperText && (
                <View style={styles.messageContainer}>
                    <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                        {helperText}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        minHeight: 52,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        letterSpacing: 0.3,
    },
    inputWithLeftIcon: {
        paddingLeft: 12,
    },
    inputWithRightIcon: {
        paddingRight: 12,
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
    eyeButton: {
        padding: 8,
        marginLeft: 4,
    },
    messageContainer: {
        marginTop: 8,
        paddingHorizontal: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    helperText: {
        fontSize: 13,
        letterSpacing: 0.2,
    },
});