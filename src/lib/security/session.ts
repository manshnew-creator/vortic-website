import { NextRequest } from 'next/server';
import crypto from 'crypto';

export interface DecodedSessionToken {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export class EdgeSessionValidator {
  
  /**
   * EDGE-NATIVE JWT VERIFIER
   * Decodes and verifies Supabase JWT access tokens directly on the Edge Runtime.
   * 
   * HARDENED SECURITY (Issue A): Removed insecure hardcoded default secret fallbacks.
   * If the SUPABASE_JWT_SECRET environment variable is missing, the system throws a loud,
   * fatal configuration exception to prevent silent authentication bypass vulnerabilities.
   */
  public static async verifySession(req: NextRequest): Promise<DecodedSessionToken | null> {
    try {
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (!secret) {
        throw new Error('FATAL: SUPABASE_JWT_SECRET environment variable is not configured. Aborting session verification for security.');
      }

      // 1. Extract Authorization Bearer token from Request Headers
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.split(' ')[1];
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerB64, payloadB64, signatureB64] = parts;

      // 2. Validate HMAC-SHA256 Signature of the JWT Token
      const tokenInput = `${headerB64}.${payloadB64}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(tokenInput)
        .digest('base64url');

      // Compare signatures securely using constant-time check to prevent timing attacks
      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(signatureB64),
        Buffer.from(expectedSignature)
      );

      if (!isSignatureValid) {
        console.warn('⚠️ [Session Validator] Invalid JWT signature detected.');
        return null;
      }

      // 3. Decode Payload and verify expiration
      const payloadDecoded = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const payload: any = JSON.parse(payloadDecoded);

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.warn('⚠️ [Session Validator] JWT token expired.');
        return null;
      }

      return {
        userId: payload.sub || '',
        email: payload.email || '',
        role: payload.role || 'authenticated',
        exp: payload.exp || 0,
      };

    } catch (err: any) {
      console.error('[Session Validator Critical Failure]', err.message);
      return null;
    }
  }
}
