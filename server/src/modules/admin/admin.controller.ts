import { Prisma } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.js'

const REVENUE_STATUSES = new Set(['PAID', 'SHIPPED', 'DELIVERED'])

function toNumber(value: Prisma.Decimal | null | undefined): number {
  return value ? Number(value) : 0
}

function dayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export class AdminController {
  async stats(_request: FastifyRequest, reply: FastifyReply) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 6)

    const [
      totalOrders,
      groupedByStatus,
      totalProducts,
      activeProducts,
      lowStockCount,
      outOfStockCount,
      totalClients,
      totalCategories,
      recentOrders,
      lowStockProducts,
      recentPaidOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { total: true }
      }),
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: true, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { active: true, stock: 0 } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.category.count({ where: { active: true } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
          payment: true
        }
      }),
      prisma.product.findMany({
        where: { active: true, stock: { lte: 5 } },
        orderBy: [{ stock: 'asc' }, { name: 'asc' }],
        take: 5,
        include: {
          category: { select: { id: true, name: true, slug: true } }
        }
      }),
      prisma.order.findMany({
        where: {
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: start }
        },
        select: { createdAt: true, total: true }
      })
    ])

    const statusCounts: Record<string, number> = {
      PENDING: 0,
      PAID: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELED: 0
    }

    let revenue = 0
    let pendingRevenue = 0
    let paidOrders = 0

    for (const group of groupedByStatus) {
      statusCounts[group.status] = group._count._all
      const total = toNumber(group._sum.total)

      if (REVENUE_STATUSES.has(group.status)) {
        revenue += total
        paidOrders += group._count._all
      }

      if (group.status === 'PENDING') {
        pendingRevenue = total
      }
    }

    const salesLast7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const key = dayKey(date)
      const dayOrders = recentPaidOrders.filter((order) => dayKey(order.createdAt) === key)

      return {
        date: key,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + toNumber(order.total), 0)
      }
    })

    return reply.status(200).send({
      stats: {
        totalOrders,
        statusCounts,
        revenue,
        pendingRevenue,
        averageTicket: paidOrders > 0 ? revenue / paidOrders : 0,
        totalProducts,
        activeProducts,
        lowStockCount,
        outOfStockCount,
        totalClients,
        totalCategories
      },
      recentOrders,
      lowStockProducts,
      salesLast7Days
    })
  }
}

export const adminController = new AdminController()
