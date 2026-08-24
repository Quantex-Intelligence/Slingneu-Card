# TCSLINGNEO API Integration Service

This service provides a middleware layer for integrating with the TCSLINGNEO API. It handles all the necessary authentication and request/response formatting.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sling-backend
JWT_SECRET=your-jwt-secret-key
OTPLESS_CLIENT_ID=your-otpless-client-id
OTPLESS_CLIENT_SECRET=your-otpless-client-secret
TCSLINGNEO_BASE_URL=https://sit-secure.yappay.in
TCSLINGNEO_TENANT=TCSLINGNEO
TCSLINGNEO_PARTNER_ID=TCSLINGNEO
TCSLINGNEO_PARTNER_TOKEN=Basic VENTTElOR05FTw==
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Firebase Configuration (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Check User Exists
- **POST** `/api/auth/check-user`
- Body: `{ "phone": "string" }`

#### Send OTP
- **POST** `/api/auth/send-otp`
- Body: `{ "phone": "string" }`

#### Verify OTP
- **POST** `/api/auth/verify-otp`
- Body: `{ "phone": "string", "otp": "string", "orderId": "string" }`

#### Signup
- **POST** `/api/auth/signup`
- Body: `{ "name": "string", "phone": "string" }`

#### Login
- **POST** `/api/auth/login`
- Body: `{ "phone": "string", "otp": "string", "orderId": "string" }`

#### Update Profile
- **PUT** `/api/auth/update-profile`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "string", "phone": "string", "isKyc": boolean, "kycDetails": object }`

#### Upload Profile Image
- **POST** `/api/auth/upload-profile-image`
- Headers: `Authorization: Bearer <token>`
- Body: `multipart/form-data` with `profile` field containing image file
- Supported formats: JPG, PNG, GIF, WebP
- Max file size: 5MB

#### Update Profile Image
- **PUT** `/api/auth/update-profile-image`
- Headers: `Authorization: Bearer <token>`
- Body: `multipart/form-data` with `profile` field containing image file
- Replaces existing profile image

#### Delete Profile Image
- **DELETE** `/api/auth/delete-profile-image`
- Headers: `Authorization: Bearer <token>`
- Removes profile image from Cloudinary and user record

#### Update FCM Token
- **PUT** `/api/auth/update-fcm-token`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "fcmToken": "string" }`
- Updates user's Firebase Cloud Messaging token for push notifications

### Admin Management

#### Admin Login
- **POST** `/api/admin/send-otp`
- Body: `{ "phone": "string" }`

- **POST** `/api/admin/login`
- Body: `{ "phone": "string", "otp": "string", "orderId": "string" }`

#### User Management
- **GET** `/api/admin/users` - Get all users
- **GET** `/api/admin/users/search` - Search users with filters
- **GET** `/api/admin/users/:id` - Get user by ID
- **PUT** `/api/admin/users/:id` - Update user
- **DELETE** `/api/admin/users/:id` - Delete user

#### Push Notifications (Admin Only)
- **POST** `/api/admin/notifications/send-to-all`
- Headers: `Authorization: Bearer <admin_token>`
- Body: `{ "title": "string", "body": "string", "data": object }`
- Sends notification to all users with FCM tokens

- **POST** `/api/admin/notifications/send-to-users`
- Headers: `Authorization: Bearer <admin_token>`
- Body: `{ "userIds": ["string"], "title": "string", "body": "string", "data": object }`
- Sends notification to specific users

- **PUT** `/api/admin/users/:id/fcm-token`
- Headers: `Authorization: Bearer <admin_token>`
- Body: `{ "fcmToken": "string" }`
- Updates FCM token for a specific user (admin only)

- **GET** `/api/admin/notifications/stats`
- Headers: `Authorization: Bearer <admin_token>`
- Returns notification statistics (total users, users with FCM tokens, etc.)

### KYC Operations

#### Generate OTP
- **POST** `/api/slingneo/generate-otp`
- Body: `{ "entityId": "string", "mobileNumber": "string" }`

#### Register Customer
- **POST** `/api/slingneo/register`
- Body: Customer registration data

### Wallet Operations

#### Load Wallet
- **POST** `/api/slingneo/load-wallet`
- Body: Wallet loading data

#### Fetch Balance
- **GET** `/api/slingneo/balance/:entityId`

### Card Management

#### Lock/Unlock Card
- **POST** `/api/slingneo/card/lock-unlock`
- Body: `{ "entityId": "string", "kitNo": "string", "flag": "string", "reason": "string" }`

#### Replace Card
- **POST** `/api/slingneo/card/replace`
- Body: `{ "entityId": "string", "oldKitNo": "string", "newKitNo": "string" }`

#### Request Physical Card
- **POST** `/api/slingneo/card/physical`
- Body: `{ "entityId": "string", "kitNo": "string", "addressDto": object }`

#### Get Card List
- **POST** `/api/slingneo/card/list`
- Body: `{ "entityId": "string" }`

### Transaction Operations

#### Fetch Transactions
- **GET** `/api/slingneo/transactions/:entityId`
- Query Parameters: `fromDate`, `toDate`, `pageNumber`, `pageSize`

### Preference Operations

#### Set Transaction Limit
- **POST** `/api/slingneo/preferences/set-limit`
- Body: `{ "entityId": "string", "limitConfig": object }`

#### Fetch Preferences
- **POST** `/api/slingneo/preferences/fetch`
- Body: `{ "entityId": "string" }`

## Push Notifications

The service includes a comprehensive push notification system using Firebase Cloud Messaging (FCM).

### Features
- Send notifications to all users
- Send notifications to specific users
- FCM token management
- Notification statistics
- Support for custom data payloads
- Cross-platform support (Android & iOS)

### Setup
1. Create a Firebase project
2. Generate service account key
3. Configure environment variables (see setup section)
4. See `FIREBASE_SETUP.md` for detailed instructions

### Usage Examples

#### Send to All Users
```bash
curl -X POST http://localhost:3000/api/admin/notifications/send-to-all \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome!",
    "body": "Thank you for using our app!",
    "data": {
      "type": "welcome",
      "screen": "home"
    }
  }'
```

#### Update User FCM Token
```bash
curl -X PUT http://localhost:3000/api/auth/update-fcm-token \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "user_fcm_token_here"
  }'
```

### Testing
Run the test script to verify notification functionality:
```bash
node test-notifications.js
```

## Profile Image Features

### Image Processing
- Automatic image optimization and resizing (400x400px)
- Face detection and cropping
- Quality optimization
- Support for multiple image formats

### Storage
- Images stored securely on Cloudinary
- Automatic cleanup of old images when updating
- Efficient CDN delivery

### Security
- File type validation (images only)
- File size limits (5MB max)
- Secure file handling with temporary storage cleanup

## Error Handling

The service includes comprehensive error handling. All errors are returned in the following format:

```json
{
    "status": number,
    "message": "string",
    "error": object // Only in development mode
}
```

## Security

- CORS enabled
- Helmet security headers
- Environment variable configuration
- Error details hidden in production
- JWT authentication for protected routes
- File upload validation and sanitization
- Admin role-based access control

## Dependencies

### Core Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **axios**: HTTP client for external APIs
- **cloudinary**: Cloud image management
- **multer**: File upload handling
- **firebase-admin**: Firebase Cloud Messaging

### Security & Middleware
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **morgan**: HTTP request logging

### Development
- **nodemon**: Auto-restart for development
- **dotenv**: Environment variable management
