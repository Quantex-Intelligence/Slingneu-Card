#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Setup Verification Script');
console.log('=====================================\n');

// Check if google-services.json exists
const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
if (fs.existsSync(googleServicesPath)) {
  console.log('✅ google-services.json found');
  
  try {
    const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
    const packageName = googleServices.client[0].android_client_info.package_name;
    console.log(`✅ Package name in google-services.json: ${packageName}`);
  } catch (error) {
    console.log('❌ Error reading google-services.json:', error.message);
  }
} else {
  console.log('❌ google-services.json not found');
}

// Check app.json configuration
const appJsonPath = path.join(__dirname, '..', 'app.json');
if (fs.existsSync(appJsonPath)) {
  console.log('✅ app.json found');
  
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const androidPackage = appJson.expo.android.package;
    console.log(`✅ Android package in app.json: ${androidPackage}`);
    
    // Check Firebase plugins
    const firebasePlugins = appJson.expo.plugins.filter(plugin => 
      Array.isArray(plugin) && 
      (plugin[0].includes('@react-native-firebase/app') || plugin[0].includes('@react-native-firebase/messaging'))
    );
    
    if (firebasePlugins.length > 0) {
      console.log('✅ Firebase plugins configured in app.json');
      firebasePlugins.forEach(plugin => {
        const packageName = plugin[1]?.android_package_name;
        if (packageName) {
          console.log(`   - ${plugin[0]}: ${packageName}`);
        }
      });
    } else {
      console.log('❌ Firebase plugins not found in app.json');
    }
  } catch (error) {
    console.log('❌ Error reading app.json:', error.message);
  }
} else {
  console.log('❌ app.json not found');
}

// Check build.gradle
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  console.log('✅ build.gradle found');
  
  try {
    const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
    const applicationIdMatch = buildGradle.match(/applicationId\s+['"]([^'"]+)['"]/);
    if (applicationIdMatch) {
      console.log(`✅ Application ID in build.gradle: ${applicationIdMatch[1]}`);
    } else {
      console.log('❌ Application ID not found in build.gradle');
    }
  } catch (error) {
    console.log('❌ Error reading build.gradle:', error.message);
  }
} else {
  console.log('❌ build.gradle not found');
}
