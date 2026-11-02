import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { CreateCategoryInput } from './categories.schemas.js'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export class CategoriesController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: { where: { active: true } } }
        }
      }
    })

    return reply.status(200).send({ categories })
  }

  async create(request: FastifyRequest<{ Body: CreateCategoryInput }>, reply: FastifyReply) {
    const { name, slug } = request.body
    const finalSlug = slug || generateSlug(name)

    const existingCategory = await prisma.category.findUnique({
      where: { slug: finalSlug }
    })

    if (existingCategory) {
      return reply.status(400).send({ message: 'Já existe uma categoria com este slug.' })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug
      }
    })

    return reply.status(201).send({ category })
  }
}

export const categoriesController = new CategoriesController()

