import { FastifyInstance } from 'fastify'
import { addressesRoutes } from './modules/addresses/addresses.routes.js'
import { adminRoutes } from './modules/admin/admin.routes.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { categoriesRoutes } from './modules/categories/categories.routes.js'
import { ordersRoutes } from './modules/orders/orders.routes.js'
import { paymentsRoutes, webhookRoutes } from './modules/payments/payments.routes.js'
import { productsRoutes } from './modules/products/products.routes.js'
import { shippingRoutes } from './modules/shipping/shipping.routes.js'

export async function appRoutes(app: FastifyInstance) {
  // Rota de Health Check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Prefixo para as rotas da API
  app.register(authRoutes, { prefix: '/api/auth' })
  app.register(adminRoutes, { prefix: '/api/admin' })
  app.register(addressesRoutes, { prefix: '/api/addresses' })
  app.register(categoriesRoutes, { prefix: '/api/categories' })
  app.register(productsRoutes, { prefix: '/api/products' })
  app.register(ordersRoutes, { prefix: '/api/orders' })
  app.register(shippingRoutes, { prefix: '/api/shipping' })
  app.register(paymentsRoutes, { prefix: '/api/payments' })
  app.register(webhookRoutes, { prefix: '/api/webhooks' })
}
