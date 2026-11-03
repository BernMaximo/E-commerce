import { Prisma } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import {
  CreateProductInput,
  ListAllProductsQuery,
  ListProductsQuery,
  UpdateProductInput
} from './products.schemas.js'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export class ProductsController {
  async list(request: FastifyRequest<{ Querystring: ListProductsQuery }>, reply: FastifyReply) {
    const { search, category, minPrice, maxPrice, page, limit, sort } = request.query

    const where: Prisma.ProductWhereInput = {
      active: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = new Prisma.Decimal(minPrice)
      if (maxPrice !== undefined) where.price.lte = new Prisma.Decimal(maxPrice)
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    if (sort === 'price_asc') orderBy = { price: 'asc' }
    if (sort === 'price_desc') orderBy = { price: 'desc' }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    return reply.status(200).send({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  }

  async listAll(request: FastifyRequest<{ Querystring: ListAllProductsQuery }>, reply: FastifyReply) {
    const { search, categoryId, active, page, limit, sort } = request.query

    const where: Prisma.ProductWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (active !== undefined) {
      where.active = active === 'true'
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    if (sort === 'price_asc') orderBy = { price: 'asc' }
    if (sort === 'price_desc') orderBy = { price: 'desc' }
    if (sort === 'name_asc') orderBy = { name: 'asc' }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    return reply.status(200).send({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  }

  async getBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const { slug } = request.params

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    if (!product || !product.active) {
      return reply.status(404).send({ message: 'Produto não encontrado ou indisponível.' })
    }

    return reply.status(200).send({ product })
  }

  async create(request: FastifyRequest<{ Body: CreateProductInput }>, reply: FastifyReply) {
    const data = request.body
    const finalSlug = data.slug || `${generateSlug(data.name)}-${Date.now().toString().slice(-4)}`

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      return reply.status(400).send({ message: 'Categoria informada não existe.' })
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug: finalSlug }
    })

    if (existingProduct) {
      return reply.status(400).send({ message: 'Já existe um produto com este slug.' })
    }

    const product = await prisma.product.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: finalSlug,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        stock: data.stock,
        imageUrl: data.imageUrl,
        weightG: data.weightG,
        lengthCm: data.lengthCm,
        widthCm: data.widthCm,
        heightCm: data.heightCm,
        active: true
      },
      include: {
        category: true
      }
    })

    return reply.status(201).send({ product })
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductInput }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const data = request.body

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return reply.status(404).send({ message: 'Produto não encontrado.' })
    }

    const updateData: Prisma.ProductUpdateInput = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price)
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
    if (data.weightG !== undefined) updateData.weightG = data.weightG
    if (data.lengthCm !== undefined) updateData.lengthCm = data.lengthCm
    if (data.widthCm !== undefined) updateData.widthCm = data.widthCm
    if (data.heightCm !== undefined) updateData.heightCm = data.heightCm
    if (data.active !== undefined) updateData.active = data.active

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      })
      if (!category) {
        return reply.status(400).send({ message: 'Categoria informada não existe.' })
      }
      updateData.category = { connect: { id: data.categoryId } }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    })

    return reply.status(200).send({ product })
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return reply.status(404).send({ message: 'Produto não encontrado.' })
    }

    // Soft delete para manter integridade com histórico de pedidos
    await prisma.product.update({
      where: { id },
      data: { active: false }
    })

    return reply.status(204).send()
  }
}

export const productsController = new ProductsController()

