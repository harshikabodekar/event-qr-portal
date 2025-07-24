# 📧 Email Confirmation Setup Guide

## 🚨 Quick Fix (Recommended for Development)

### Option 1: Disable Email Confirmation in Supabase

1. **Go to your Supabase Dashboard**
2. **Navigate to**: Authentication → Settings
3. **Find**: "Enable email confirmations"
4. **Turn it OFF** (toggle to disabled)
5. **Click "Save"**

This will allow users to sign up and sign in immediately without email confirmation.

---

## 🔧 Production Setup (Email Confirmation Enabled)

If you want to keep email confirmation enabled (recommended for production):

### Step 1: Configure Email Templates in Supabase

1. **Go to**: Authentication → Email Templates
2. **Configure "Confirm signup" template**:
   - **Subject**: `Confirm your email for Event QR Portal`
   - **Body**: Use the default template or customize it
   - **Redirect URL**: `{{ .SiteURL }}/confirm`

### Step 2: Set Up Site URL in Supabase

1. **Go to**: Authentication → Settings
2. **Set Site URL**: `http://localhost:3001` (for development)
3. **Add redirect URLs**:
   - `http://localhost:3001/confirm`
   - `http://localhost:3001/`
   - Add your production URLs when deploying

### Step 3: Environment Variables

Make sure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 4: Email Provider (for Production)

1. **Go to**: Authentication → Settings → SMTP Settings
2. **Configure your email provider** (SendGrid, Amazon SES, etc.)
3. **Test the email delivery**

---

## 🎯 How the Email Confirmation Flow Works

### With Email Confirmation Enabled:

1. **User Signs Up** → Account created but not confirmed
2. **Email Sent** → User receives confirmation email
3. **User Clicks Link** → Redirected to `/confirm` page
4. **Email Confirmed** → User can now sign in
5. **Sign In** → Access to portal granted

### With Email Confirmation Disabled:

1. **User Signs Up** → Account created and immediately active
2. **Instant Access** → User can sign in right away
3. **No Email Required** → Direct access to portal

---

## 🔍 Troubleshooting

### "Email not confirmed" Error:
- Check if email confirmation is enabled in Supabase
- Verify the user clicked the confirmation link
- Check spam/junk folder for confirmation email

### Email Not Received:
- Check SMTP settings in Supabase
- Verify email templates are configured
- Test with different email providers

### Redirect Issues:
- Ensure Site URL is correctly set in Supabase
- Check redirect URLs include `/confirm`
- Verify the confirmation page exists

---

## 📝 Current Implementation Status

✅ **Email confirmation handling in auth page**
✅ **Confirmation page created at `/confirm`**
✅ **Proper error messages for unconfirmed emails**
✅ **Supabase client configured with redirect URL**

**Recommended**: Disable email confirmation for development, enable for production.
