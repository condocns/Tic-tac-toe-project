import { NextRequest } from "next/server";

// Security event types
export type SecurityEvent = 
  | "RATE_LIMIT_EXCEEDED"
  | "UNAUTHORIZED_ACCESS"
  | "FORBIDDEN_ACCESS"
  | "SUSPICIOUS_ACTIVITY"
  | "ADMIN_ACCESS"
  | "AUTH_FAILURE"
  | "VALIDATION_ERROR";

// Security log entry
interface SecurityLogEntry {
  timestamp: string;
  event: SecurityEvent;
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  endpoint?: string;
  details?: Record<string, any>;
}

// Singleton security logger (SOLID: Single Responsibility)
class SecurityLogger {
  private static instance: SecurityLogger;
  private logs: SecurityLogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  static getInstance(): SecurityLogger {
    if (!this.instance) {
      this.instance = new SecurityLogger();
    }
    return this.instance;
  }

  private log(entry: Omit<SecurityLogEntry, "timestamp">): void {
    const logEntry: SecurityLogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SECURITY] ${logEntry.event}:`, logEntry);
    }

    // In production, you might want to send to external logging service
    // this.sendToExternalService(logEntry);
  }

  public logRateLimitExceeded(request: NextRequest, details?: Record<string, any>): void {
    this.log({
      event: "RATE_LIMIT_EXCEEDED",
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      endpoint: request.nextUrl.pathname,
      details,
    });
  }

  public logUnauthorizedAccess(request: NextRequest, details?: Record<string, any>): void {
    this.log({
      event: "UNAUTHORIZED_ACCESS",
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      endpoint: request.nextUrl.pathname,
      details,
    });
  }

  public logForbiddenAccess(request: NextRequest, userId?: string, email?: string): void {
    this.log({
      event: "FORBIDDEN_ACCESS",
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      userId,
      email,
      endpoint: request.nextUrl.pathname,
    });
  }

  public logAdminAccess(request: NextRequest, userId: string, email: string): void {
    this.log({
      event: "ADMIN_ACCESS",
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      userId,
      email,
      endpoint: request.nextUrl.pathname,
    });
  }

  public logAuthFailure(request: NextRequest, details?: Record<string, any>): void {
    this.log({
      event: "AUTH_FAILURE",
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      endpoint: request.nextUrl.pathname,
      details,
    });
  }

  public logSuspiciousActivity(request: NextRequest, details: Record<string, any>): void {
    this.log({
      event: "SUSPICIOUS_ACTIVITY",
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      endpoint: request.nextUrl.pathname,
      details,
    });
  }

  public getRecentLogs(count: number = 50): SecurityLogEntry[] {
    return this.logs.slice(-count);
  }

  public getLogsByEvent(event: SecurityEvent, count: number = 50): SecurityLogEntry[] {
    return this.logs
      .filter(log => log.event === event)
      .slice(-count);
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "anonymous"
    );
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance();

// Helper functions for common logging scenarios
export const logSecurityEvent = {
  rateLimitExceeded: (request: NextRequest, details?: Record<string, any>) =>
    securityLogger.logRateLimitExceeded(request, details),
    
  unauthorizedAccess: (request: NextRequest, details?: Record<string, any>) =>
    securityLogger.logUnauthorizedAccess(request, details),
    
  forbiddenAccess: (request: NextRequest, userId?: string, email?: string) =>
    securityLogger.logForbiddenAccess(request, userId, email),
    
  adminAccess: (request: NextRequest, userId: string, email: string) =>
    securityLogger.logAdminAccess(request, userId, email),
    
  authFailure: (request: NextRequest, details?: Record<string, any>) =>
    securityLogger.logAuthFailure(request, details),
    
  suspiciousActivity: (request: NextRequest, details: Record<string, any>) =>
    securityLogger.logSuspiciousActivity(request, details),
};
