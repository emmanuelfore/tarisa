import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from "react-native-web";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { theme } from "@/theme";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [ward, setWard] = useState("");

  const handleSignup = () => {
    if (!agreed) return;
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setLocation('/citizen/home');
    }, 1500);
  };

  return (
    <MobileLayout showNav={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <Link href="/">
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.gray800} />
          </TouchableOpacity>
        </Link>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image source={{ uri: appIcon }} style={styles.appIcon} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join TARISA to improve your community</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. Tatenda Phiri"
              placeholderTextColor={theme.colors.gray400}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>National ID Number</Text>
            <TextInput 
              style={[styles.input, styles.monoInput]}
              placeholder="63-XXXXXXX X XX"
              placeholderTextColor={theme.colors.gray400}
            />
            <Text style={styles.helperText}>Format: 63-1234567 F 42</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Residential Ward</Text>
            <View style={styles.selectMock}>
               <Text style={styles.selectText}>{ward || "Select your ward"}</Text>
               <View style={styles.selectDropdown}>
                 {/* Mock dropdown content would go here, simplified for RN conversion */}
               </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+263</Text>
              </View>
              <TextInput 
                style={styles.phoneInput}
                placeholder="77 123 4567"
                keyboardType="phone-pad"
                placeholderTextColor={theme.colors.gray400}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor={theme.colors.gray400}
            />
          </View>

          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setAgreed(!agreed)}
          >
            <View style={[styles.checkbox, agreed && styles.checkedCheckbox]}>
              {agreed && <Check size={12} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the <Text style={{ color: theme.colors.primary }}>Terms of Service</Text> and verify that I am a resident of the selected ward.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !agreed && styles.disabledButton]} 
            onPress={handleSignup}
            disabled={loading || !agreed}
          >
            {loading ? (
              <Loader2 size={20} color="white" style={styles.spinner} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login">
            <Text style={styles.linkText}>Log in</Text>
          </Link>
        </View>
      </ScrollView>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
    marginLeft: -8,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray900,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: theme.colors.gray900,
    outlineStyle: 'none',
  },
  monoInput: {
    fontFamily: 'monospace',
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.gray400,
  },
  selectMock: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 16,
    color: theme.colors.gray400,
  },
  selectDropdown: {
    // Hidden in mock
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCode: {
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 8,
    backgroundColor: theme.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray500,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: theme.colors.gray900,
    outlineStyle: 'none',
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkedCheckbox: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.gray500,
    lineHeight: 18,
  },
  button: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    // animation handled by lucide? no, needs css animation on web or reanimated. 
    // Static for now
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.gray500,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});
