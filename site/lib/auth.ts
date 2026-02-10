import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const ADMIN_PASSWORD_HASH = '$2a$10$YourHashHere' // Will be generated

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(SECRET_KEY))

  return token
}

export async function verifySession(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY))
    return verified.payload as { userId: string; role: string }
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token) return null

  return verifySession(token)
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null && session.role === 'admin'
}

// Admin credentials (hash generated from secure password)
export const ADMIN_CREDENTIALS = {
  email: 'admin@coding-prompts.dev',
  passwordHash: '$2b$10$yZn7DsAJskR49jPqSEERdOQHF7H.Zi9vWyJ.q7K0b6bfgpwvyYk5y'
}
