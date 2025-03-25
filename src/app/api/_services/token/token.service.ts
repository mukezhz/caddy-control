import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const secretKey: string = process.env.JWT_SECRET;

/**
 * Generates a JWT token
 * @param payload The payload to encode into the token
 * @param expiresIn Expiry time for the token (default: 1 day)
 * @returns The generated JWT token
 */
const generateToken = (payload: string | object | Buffer, expiresIn: number = 86400000): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secretKey, options);
};

/**
 * Verifies a JWT token
 * @param token The JWT token to verify
 * @returns The decoded payload if valid, or throws an error if invalid
 */
const verifyToken = (token: string): JwtPayload | string | boolean => {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return false
  }
};

/**
 * Decodes a JWT token without verifying
 * @param token The JWT token to decode
 * @returns The decoded payload
 */
const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};

export { generateToken, verifyToken, decodeToken };
