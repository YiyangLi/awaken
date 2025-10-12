# Installing Awaken on Amazon Fire HD 10

## Step 1: Enable Installation from Unknown Sources

1. On your Fire HD 10, go to **Settings**
2. Tap **Security & Privacy**
3. Toggle **Install Unknown Apps** to ON (or enable for your file manager/Dropbox app)

**Alternative path** (older Fire OS versions):
- Settings → Security → **Apps from Unknown Sources** → Toggle ON

## Step 2: Transfer the APK File

### Option A: Via Dropbox (Recommended)
1. Upload the APK file (`awaken-release.apk`) to your Dropbox
2. On your Fire tablet, open the Dropbox app
3. Find the APK file and tap it
4. Tap **Download** (save to your tablet)

### Option B: Via Email
1. Email the APK file to yourself
2. Open the email on your Fire tablet
3. Download the attachment

### Option C: Via USB Cable (if you prefer)
1. Connect Fire tablet to Mac via USB
2. Unlock the tablet
3. On Mac, open **Android File Transfer** (or Finder if it mounts)
4. Copy the APK file to **Downloads** folder on the tablet

## Step 3: Install the APK

1. On your Fire tablet, open the **Silk Browser** or **File Manager**
2. Navigate to **Downloads**
3. Tap on **awaken-release.apk**
4. You'll see a prompt asking if you want to install
5. Tap **Install**
6. Wait for installation to complete (usually 10-30 seconds)
7. Tap **Open** to launch the app

## Step 4: First Launch

When you first open Awaken:
1. The app will request permissions (WiFi, Network State)
2. Tap **Allow** for all permissions
3. The app will open to the customer menu screen

## Step 5: Configure Printer (Admin Mode)

1. In the app, switch to **Admin Mode** (PIN: 1234)
2. Tap **Printer Settings**
3. Enter your Brother QL-810W printer's IP address
   - To find printer IP: Print a network configuration page from the printer
   - Or check your router's connected devices list
4. Tap **Save**
5. Tap **Search for Printers** to discover the printer automatically (if discovery doesn't work on Fire OS, manual IP entry is fine)
6. Tap **Print Test Label** to verify connection

## Troubleshooting

### Installation Issues

**"App not installed"**:
- Make sure "Install Unknown Apps" is enabled
- Try restarting your Fire tablet
- Re-download the APK file

**"Parse error"**:
- The APK file may be corrupted
- Re-download or re-transfer the APK

### Printer Connection Issues

**Printer not discovered**:
- Fire OS may have limited mDNS/NSD support
- Use manual IP address entry instead
- Make sure tablet and printer are on the same WiFi network

**Print test fails**:
- Verify printer is turned on
- Check IP address is correct
- Ping the printer from another device to confirm network connectivity
- Make sure printer is connected to WiFi (not USB mode)

**"Printer not found"**:
- Restart the Brother QL-810W printer
- Reconnect tablet to WiFi
- Try entering the IP address manually instead of using discovery

### App Issues

**App crashes on launch**:
- Clear app data: Settings → Apps → Awaken → Clear Data
- Reinstall the app

**Printer settings don't save**:
- Check app permissions (Settings → Apps → Awaken → Permissions)
- Make sure storage permission is granted

## APK File Location

After building, the APK file is located at:
```
/Users/yiyangli/funcave/awaken/android/app/build/outputs/apk/release/app-release.apk
```

You can rename it to `awaken-release.apk` for easier identification.

## Notes

- **No expiry**: Unlike iOS free developer builds, Android APKs never expire
- **Updates**: To update the app, simply install the new APK over the old one (data will be preserved)
- **Multiple tablets**: You can install the same APK on unlimited Fire tablets
- **WiFi printing only**: This version supports WiFi printing only (Bluetooth can be added later)
- **Fire OS compatibility**: Tested on Fire OS 8 (based on Android 11)

## App Features

### User Mode (Default)
- Browse coffee menu
- Customize drinks (milk, shots, syrups, etc.)
- Review order and enter customer name
- Submit orders

### Admin Mode (PIN: 1234)
- View all orders
- Filter by status (pending, in-progress, ready, completed)
- Change order status
- View inventory analysis
- Manage syrup flavors (add, mark sold out, delete)
- **Configure Brother QL-810W printer** (NEW in this build)

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Enable ADB debugging (Settings → Device Options → Developer Options)
3. Connect via USB and run: `adb logcat | grep -i "ReactNativeJS"`
4. Share the logs for debugging assistance

## Version Information

- **App Version**: 1.0.0
- **Package**: com.awaken.coffeeapp
- **Build Type**: Release (unsigned)
- **Target**: Android 11+ (Fire OS 8+)
- **Features**: Complete coffee ordering system + Brother QL-810W printer integration
