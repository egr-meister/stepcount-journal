# StepCount Journal — ProGuard/R8 rules.
# After `npx expo prebuild`, copy this file to android/app/proguard-rules.pro
# (or merge its contents). These are standard, safe keep rules for an
# Expo / React Native app. No third-party obfuscation tooling is used —
# only the default Android R8 / proguard-android-optimize pipeline.

# ---- React Native core ----
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# ---- Hermes ----
-keep class com.facebook.hermes.unicode.** { *; }

# ---- react-native-svg ----
-keep public class com.horcrux.svg.** { *; }

# ---- react-native-screens / safe-area-context ----
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

# ---- AsyncStorage ----
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ---- Expo ----
-keep class expo.modules.** { *; }
-keep class versioned.host.exp.exponent.** { *; }

# Keep annotations and generic signatures (needed by reflection-based libs).
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Silence common warnings.
-dontwarn com.facebook.react.**
-dontwarn expo.modules.**
-dontwarn com.horcrux.svg.**
