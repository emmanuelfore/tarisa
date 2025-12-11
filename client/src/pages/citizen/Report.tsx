import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from "react-native-web";
import { Camera, MapPin, ChevronLeft, ChevronRight, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { theme } from "@/theme";

const CATEGORIES = [
  { id: 'roads', label: 'Roads', icon: '🚧' },
  { id: 'water', label: 'Water', icon: '💧' },
  { id: 'sewer', label: 'Sewer', icon: '🕳️' },
  { id: 'waste', label: 'Waste', icon: '🗑️' },
  { id: 'lights', label: 'Lights', icon: '💡' },
  { id: 'other', label: 'Other', icon: '📝' },
];

export default function ReportIssue() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Report Submitted!",
        description: "Your tracking ID is TAR-2025-0042. You earned +5 points!",
        duration: 5000,
      });
      setLocation('/citizen/home');
    }, 1500);
  };

  return (
    <MobileLayout showNav={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => step === 1 ? setLocation('/citizen/home') : prevStep()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={theme.colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <Text style={styles.stepIndicator}>{step}/4</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(step / 4) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1: Photo */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.textCenter}>
              <Text style={styles.heading}>Snap a Photo</Text>
              <Text style={styles.subheading}>Take a clear picture of the issue to help us locate and fix it.</Text>
            </View>

            <TouchableOpacity style={styles.cameraBox}>
              <View style={styles.cameraIconCircle}>
                <Camera size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.cameraText}>Tap to take photo</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => {}}>
                <Upload size={16} color={theme.colors.gray800} style={{ marginRight: 8 }} />
                <Text style={styles.outlineButtonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={nextStep}>
                <Text style={styles.primaryButtonText}>Skip Photo</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={[styles.button, styles.primaryButton, { width: '100%', marginTop: 24 }]} onPress={nextStep}>
              <Text style={styles.primaryButtonText}>Next Step</Text>
              <ChevronRight size={16} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <View style={styles.stepContainer}>
             <View style={styles.textCenter}>
              <Text style={styles.heading}>Confirm Location</Text>
              <Text style={styles.subheading}>We detected your location automatically. Is this correct?</Text>
            </View>

            <View style={styles.mapPreview}>
               {/* Mock Map View */}
               <View style={styles.mapPlaceholder}>
                 <MapPin size={48} color={theme.colors.primary} />
               </View>
               <View style={styles.locationCard}>
                 <Text style={styles.locationText}>123 Samora Machel Avenue, Harare</Text>
               </View>
            </View>

            <TouchableOpacity style={[styles.button, styles.outlineButton, { width: '100%' }]} onPress={() => {}}>
              <MapPin size={16} color={theme.colors.gray800} style={{ marginRight: 8 }} />
              <Text style={styles.outlineButtonText}>Adjust Pin Manually</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.primaryButton, { width: '100%', marginTop: 16 }]} onPress={nextStep}>
              <Text style={styles.primaryButtonText}>Confirm Location</Text>
              <ChevronRight size={16} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <View style={styles.stepContainer}>
             <View style={styles.textCenter}>
              <Text style={styles.heading}>Issue Details</Text>
              <Text style={styles.subheading}>Categorize the problem so we send the right team.</Text>
            </View>

            <View style={styles.grid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat.id}
                  style={styles.categoryCard}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Severity Level</Text>
              <View style={styles.sliderPlaceholder}>
                 <View style={styles.sliderTrack} />
                 <View style={styles.sliderThumb} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>Low</Text>
                <Text style={styles.sliderLabelText}>Medium</Text>
                <Text style={styles.sliderLabelText}>High</Text>
                <Text style={[styles.sliderLabelText, { color: theme.colors.danger }]}>Critical</Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.button, styles.primaryButton, { width: '100%', marginTop: 24 }]} onPress={nextStep}>
              <Text style={styles.primaryButtonText}>Next Step</Text>
              <ChevronRight size={16} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <View style={styles.stepContainer}>
             <View style={styles.textCenter}>
              <Text style={styles.heading}>Review Report</Text>
              <Text style={styles.subheading}>Check if everything looks correct before submitting.</Text>
            </View>

            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewImagePlaceholder} />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewTitle}>Pothole Repair</Text>
                  <Text style={styles.reviewSubtitle}>Roads • High Severity</Text>
                  <Text style={styles.reviewLocation}>123 Samora Machel Ave</Text>
                </View>
              </View>
              
              <View style={styles.reviewDivider} />
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DESCRIPTION</Text>
                <TextInput 
                  placeholder="Add more details (optional)..." 
                  style={styles.textArea} 
                  multiline 
                  numberOfLines={3}
                />
              </View>
            </View>

            <TouchableOpacity style={[styles.button, styles.primaryButton, { width: '100%', height: 56, marginTop: 24 }]} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <Text style={styles.primaryButtonText}>Submitting...</Text>
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Submit Report</Text>
                  <CheckCircle2 size={20} color="white" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray500,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.gray100,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  content: {
    padding: 24,
  },
  stepContainer: {
    gap: 24,
  },
  textCenter: {
    alignItems: 'center',
    marginBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: 'center',
  },
  cameraBox: {
    aspectRatio: 4/3,
    backgroundColor: theme.colors.gray100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.gray300,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  cameraIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  cameraText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray500,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outlineButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flex: 1,
  },
  outlineButtonText: {
    color: theme.colors.gray900,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  mapPreview: {
    aspectRatio: 16/9,
    backgroundColor: theme.colors.gray200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray300,
  },
  locationCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 8,
    ...theme.shadows.sm,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray800,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray900,
  },
  sliderPlaceholder: {
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: theme.colors.gray200,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    left: '33%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    color: theme.colors.gray500,
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: theme.colors.gray100,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  reviewImagePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: theme.colors.gray300,
    borderRadius: 8,
  },
  reviewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewTitle: {
    fontWeight: '500',
    fontSize: 16,
    color: theme.colors.gray900,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: theme.colors.gray500,
  },
  reviewLocation: {
    fontSize: 12,
    color: theme.colors.gray400,
    marginTop: 4,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: theme.colors.gray200,
    marginVertical: 12,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    outlineStyle: 'none',
  },
});
