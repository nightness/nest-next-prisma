export const SERVER_PORT = process.env.SERVER_PORT || "3000";
export const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const HYBRID_ENV: boolean = !!process.env.HYBRID_ENV || true;

export const JWT_SECRET = process.env.JWT_PRIVATE_KEY || 'secret';
export const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || 'privateKey';
export const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';

export const DISABLE_REGISTRATION = process.env.DISABLE_REGISTRATION === 'true';

export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT: number = parseInt(process.env.REDIS_PORT || '6379', 10);

export const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
export const EMAIL_PORT = process.env.EMAIL_PORT || '465';
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
export const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@localhost';
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'noreply@localhost';

export const DISABLE_AUTH = process.env.DISABLE_AUTH === 'true';
export const EMAIL_VERIFICATION_TOKEN_EXPIRATION: number = parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION || '86400', 10);
export const MAX_CONCURRENT_EMAIL_VERIFICATION_REQUESTS = parseInt(process.env.MAX_CONCURRENT_EMAIL_VERIFICATION_REQUESTS || '5', 10);
export const MAX_CONCURRENT_PASSWORD_RESET_REQUESTS = parseInt(process.env.MAX_CONCURRENT_PASSWORD_RESET_REQUESTS || '5', 10);
export const PASSWORD_RESET_TOKEN_EXPIRATION: number = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRATION || '86400', 10);
export const ACCESS_TOKEN_EXPIRATION: number = parseInt(process.env.ACCESS_TOKEN_EXPIRATION || '3600', 10);
export const REFRESH_TOKEN_EXPIRATION: number = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '604800', 10);
export const MAX_REFRESH_TOKENS = parseInt(process.env.MAX_REFRESH_TOKENS || '5', 10); // concurrent refresh tokens per user


