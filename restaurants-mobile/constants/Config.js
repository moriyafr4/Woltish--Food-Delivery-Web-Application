import { Platform } from 'react-native';

// ============================================================================
// ATTENTION TEACHING ASSISTANTS (TAs):
// 1. If testing on Web Browser: It will use 'localhost' automatically.
// 2. If testing on iOS Simulator: Change the IP below to 'http://localhost:5000'
// 3. If testing on Android Emulator: Change the IP below to 'http://10.0.2.2:5000'
// 4. If testing on a Physical Device: Change the IP below to your PC's IPv4 address.
// ============================================================================
export const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://10.0.2.2:5000'; 
