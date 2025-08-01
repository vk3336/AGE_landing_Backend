# Backend Environment Variable (.env)

PORT : Specifies the port your backend server will run on. like 7000

BASE_URL : Defines the base URL of your backend server. http://localhost:7000.

FRONTEND_URL : Use the local URL in development and deployed URL in production.

MONGODB_URI & MONGODB_URI_TEST : A full MongoDB connection string from your MongoDB Atlas dashboard.

ALLOW_EMAIL : Allows only these emails to log in as admins.

EMAIL_SERVICE : Sets the email service provider. (gmail).

EMAIL_USER : Email address used to send emails from your server.

EMAIL_PASS : Generate this from your Google Account’s security settings.

ADMIN_SESSION_HOURS : Sets how long an admin stays logged in.

API_KEY_NAME & API_SECRET_KEY :  Used to protect admin APIs with a custom header key and secret.

Role_Management_Key & Role_Management_Key_Value : Used to control access to role management APIs.

ALLOWED_IMAGE_EXTENSIONS & ALLOWED_VIDEO_EXTENSIONS : Define which image and video file types are allowed.

MAX_IMAGE_SIZE & MAX_VIDEO_SIZE : Set maximum file size limits in bytes.

CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_PRESET :
Used to upload and manage media files using Cloudinary

STRIPE_KEY : Connects your backend to Stripe for payment processing.

# Admin Login System with OTP

This project implements an admin login system using email and OTP authentication. The admin email is configured through environment variables.

## Feature

- Admin login with email and OTP
- OTP expiration (10 minutes)
- Email-based OTP delivery
- Admin status tracking
- Secure logout functionality

## Setup Instructions

### 1. Install Dependencie

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=7000
BASE_URL=http://localhost:7000

# MongoDB Configuration
MONGODB_URI_TEST=mongodb://localhost:27017/vivek_project

# Admin Configuration
ADMIN_EMAIL=your-admin-email@example.com

# Email Configuration (for OTP sending)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Secret (for session management)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Email Configuration

For Gmail, you'll need to:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `EMAIL_PASS`

### 4. Start the Server

```bash
npm start
```

## API Endpoints

### 1. Send OTP

**POST** `/api/admin/send-otp`

```json
{
  "email": "admin@example.com"
}
```

### 2. Verify OTP and Login

**POST** `/api/admin/verify-otp`

```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

### 3. Logout

**POST** `/api/admin/logout`

### 4. Get Admin Status

**GET** `/api/admin/status`

## Security Features

- Only the email specified in `ADMIN_EMAIL` environment variable can login
- OTP expires after 10 minutes
- OTP is cleared after successful login
- Admin login status is tracked

## Usage Flow

1. Send OTP to admin email using `/api/admin/send-otp`
2. Check email for OTP
3. Verify OTP using `/api/admin/verify-otp`
4. Admin is logged in successfully
5. Use `/api/admin/logout` to logout

## Error Handling

The API includes comprehensive error handling for:

- Invalid email addresses
- Expired OTPs
- Missing environment variables
- Email sending failures
- Database connection issues
#   b a c k e n d 2 3 
 
 