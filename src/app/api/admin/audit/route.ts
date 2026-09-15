// src/app/api/admin/audit/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';
import { sanitizeAuditRecord } from '@/lib/auditSanitizer';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Query parameters: start, end (ISO dates), adminId, action, page, pageSize
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  const adminId = url.searchParams.get('adminId');
  const action = url.searchParams.get('action');
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20', 10);

  const where: any = {};
  if (start || end) {
    where.createdAt = {};
    if (start) where.createdAt.gte = new Date(start);
    if (end) where.createdAt.lte = new Date(end);
  }
  if (adminId) where.adminId = adminId;
  if (action) where.action = { contains: action, mode: 'insensitive' };

  const [total, records] = await Promise.all([
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      // Only non-sensitive actor fields: never return passwordHash / mfaSecret.
      include: { admin: { select: { id: true, name: true, email: true, role: true } } },
    }),
  ]);

  const sanitized = records.map(sanitizeAuditRecord);
  return NextResponse.json({ total, page, pageSize, records: sanitized });
}
