-- Add OTP columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS otp_code_expires_at TIMESTAMPTZ;

-- Create index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_code ON profiles(otp_code) WHERE otp_code IS NOT NULL;
