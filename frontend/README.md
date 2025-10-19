# Labia.AI Frontend

React Native mobile app for Labia.AI - Your conversation assistant with Latino flavor.

## Features

- 🇵🇷 **5 Cultural Styles**: Puerto Rico, México, Colombia, Argentina, España
- ✨ **Smart Openers**: Generate culturally-adapted conversation starters
- 💬 **Intelligent Responses**: Get 3 response suggestions with different tones
- 🎨 **Beautiful UI**: Vibrant Latino-themed gradients and design
- 🔒 **Privacy-First**: No permanent storage of conversations

## Tech Stack

- **Framework**: Expo / React Native
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **State Management**: Zustand
- **UI Library**: React Native Paper
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your phone (optional)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### Backend Configuration

The app connects to the Labia.AI backend API. Update the API URL in `src/constants/index.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://YOUR_COMPUTER_IP:8000/api/v1'  // Change to your IP
  : 'https://api.labia.ai/api/v1';
```

**Finding your IP:**
- Windows: `ipconfig` → Look for IPv4 Address
- Mac/Linux: `ifconfig` → Look for inet address

**Important**: Don't use `localhost` when testing on physical devices. Use your computer's IP address.

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (SuggestionCard, ToneSelector, etc.)
│   ├── chat/            # Chat-specific components
│   ├── onboarding/      # Onboarding components
│   └── profile/         # Profile components
├── screens/             # Screen components
│   ├── Onboarding/      # Onboarding flow (Splash, Tutorial, Country Selection)
│   ├── Chat/            # Main chat assistant screen
│   ├── Trainer/         # Trainer screen (coming soon)
│   └── Profile/         # User profile screen
├── navigation/          # Navigation configuration
│   ├── RootNavigator.tsx    # Root navigator with conditional rendering
│   ├── MainNavigator.tsx    # Bottom tab navigator
│   └── OnboardingNavigator.tsx  # Onboarding stack navigator
├── services/            # API and external services
│   └── api.ts          # API client with all endpoints
├── store/              # Zustand state management
│   ├── appStore.ts     # App-wide state (user, cultural style, tone)
│   └── chatStore.ts    # Chat state (conversation, messages)
├── types/              # TypeScript type definitions
│   └── index.ts        # All types and interfaces
├── constants/          # App constants
│   └── index.ts        # Colors, cultural styles, tones, etc.
└── utils/              # Utility functions
```

## Screens

### Onboarding Flow
1. **Splash Screen**: App logo and branding
2. **Tutorial**: 3-slide introduction to features
3. **Country Selection**: Choose your cultural style
4. **Profile Setup**: Set preferred tone and interests

### Main App
1. **Chat Assistant** (Main): Generate openers or responses
2. **Trainer**: Gamification and practice (coming soon)
3. **Profile**: User preferences and settings

## API Integration

The app integrates with the backend API endpoints:

### Openers
- `POST /api/v1/openers` - Generate 3 conversation openers
- `POST /api/v1/openers/preview` - Preview single opener
- `GET /api/v1/openers/examples` - Get example openers

### Responses
- `POST /api/v1/responses` - Generate 3 response suggestions
- `POST /api/v1/responses/safety-check` - Check content safety
- `POST /api/v1/responses/rewrite` - Rewrite inappropriate messages
- `GET /api/v1/responses/examples` - Get response examples

### Health
- `GET /api/v1/health` - Backend health check

## Development

### Running the Backend

Make sure the backend is running before starting the app:

```bash
# In the backend directory
cd ../backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn src.main:app --reload
```

The backend should be accessible at `http://localhost:8000`.

### Hot Reload

Expo supports hot reloading. Just save your files and the app will automatically update.

### Debugging

- Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open developer menu
- Enable "Debug Remote JS" to use Chrome DevTools
- Use React Native Debugger for better debugging experience

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

## Environment Variables

The app uses the following environment variables (configured in `.env`):

- `API_BASE_URL`: Backend API URL
- `API_TIMEOUT`: API request timeout (ms)
- `NODE_ENV`: Environment (development/production)

## Cultural Styles

The app supports 5 cultural styles with authentic slang and communication patterns:

1. **🇵🇷 Boricua (Puerto Rico)**: wepa, chévere, brutal
2. **🇲🇽 Mexicano (México)**: wey, chido, neta
3. **🇨🇴 Colombiano (Colombia)**: parce, bacano, chimba
4. **🇦🇷 Argentino (Argentina)**: che, boludo, copado
5. **🇪🇸 Español (España)**: tío, mola, guay

## Tones

Choose from 5 conversation tones:

- 😎 **Chill**: Relaxed, friendly, casual
- ✨ **Elegante**: Sophisticated, polished, refined
- 🤓 **Intelectual**: Thoughtful, insightful, cultured
- 🏖️ **Playero**: Beachy, laid-back, sun & fun
- ⚡ **Minimalista**: Direct, concise, no fluff

## Troubleshooting

### "Network request failed"
- Make sure backend is running
- Check if you're using the correct IP address (not localhost on physical device)
- Verify firewall isn't blocking port 8000

### "Expo Go not connecting"
- Make sure phone and computer are on same WiFi network
- Try restarting Expo CLI: `npm start --reset-cache`

### Build errors
- Clear cache: `npm start --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear watchman: `watchman watch-del-all`

## Future Features

- [ ] Authentication (login/register)
- [ ] Conversation history
- [ ] Trainer module with missions
- [ ] Voice mode with regional accents
- [ ] Dark mode
- [ ] Push notifications
- [ ] Social sharing

## Contributing

This is a beta version. Contributions, bug reports, and feature requests are welcome!

## License

MIT

## Contact

For support or questions: support@labia.ai

---

**Made with 💜 for the Latino community**
