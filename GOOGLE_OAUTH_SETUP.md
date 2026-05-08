# Google OAuth Setup Guide

This guide helps you set up Google OAuth for the Login and Sign-up pages.

## Steps to Enable Google Sign-In

### 1. Create a Google Cloud Project
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one
- Enable the Google+ API

### 2. Create OAuth 2.0 Credentials
- In the Cloud Console, go to **APIs & Services** > **Credentials**
- Click **Create Credentials** > **OAuth 2.0 Client ID**
- Choose **Web application**
- Add authorized JavaScript origins:
  - `http://localhost:5173` (for development)
  - `https://yourdomain.com` (for production)
- Add authorized redirect URIs:
  - `http://localhost:5173/login` (for development)
  - `https://yourdomain.com/login` (for production)
- Copy your **Client ID**

### 3. Install Google OAuth Library
```bash
npm install @react-oauth/google
# or
bun add @react-oauth/google
```

### 4. Update Environment Variables
Create a `.env` file in your project root:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

### 5. Update App.tsx to Include GoogleOAuthProvider
Add this to the top of `src/App.tsx`:

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App = () => (
  <GoogleOAuthProvider clientId={googleClientId}>
    <QueryClientProvider client={queryClient}>
      {/* rest of your app */}
    </QueryClientProvider>
  </GoogleOAuthProvider>
);
```

### 6. Update Login Component
Update `src/pages/Login/Login.tsx` to use Google OAuth:

```tsx
import { useGoogleLogin } from '@react-oauth/google';

// In your Login component:
const googleLogin = useGoogleLogin({
  onSuccess: async (codeResponse) => {
    // Send token to your backend
    // const { access_token } = codeResponse;
    // const response = await fetch('/api/auth/google', {
    //   method: 'POST',
    //   body: JSON.stringify({ token: access_token })
    // });
    console.log("Google login successful:", codeResponse);
  },
  onError: () => {
    console.log('Login Failed');
  },
});

// Then update the Google button onClick:
// onClick={() => googleLogin()}
```

### 7. Update Sign-up Component
Do the same for `src/pages/SignUp/SignUp.tsx`

### 8. Backend Integration
Create these API endpoints:

**POST /api/auth/google**
- Receive Google token
- Verify token with Google
- Create/update user in database
- Return JWT token

**POST /api/auth/login**
- Accept email & password
- Validate credentials
- Return JWT token

**POST /api/auth/signup**
- Accept email, password, name
- Create new user
- Return JWT token

## Example Backend Implementation (Node.js/Express)

```typescript
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name, picture } = ticket.getPayload();
    
    // Check if user exists, if not create one
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, picture, authMethod: 'google' });
    }
    
    // Create JWT token
    const jwtToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET);
    
    res.json({ user, token: jwtToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

## Testing

1. Start your development server: `npm run dev`
2. Navigate to http://localhost:5173/login
3. Click "Login with Google"
4. Complete the Google authentication flow

## Troubleshooting

- **"Invalid Client ID"**: Check that your Client ID is correct in `.env`
- **CORS errors**: Ensure your authorized origins are correctly configured in Google Cloud Console
- **Redirect URI mismatch**: Make sure your redirect URIs match exactly in Google Cloud Console

## Security Notes

- Never commit `.env` files with your Client ID
- Always verify tokens on the backend
- Store JWT tokens securely (httpOnly cookies recommended)
- Implement CSRF protection
