import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // 1. Criar usuário administrador padrão
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      name: 'Administrador da Loja',
      email: 'admin@ecommerce.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  })
  console.log('✅ Usuário Admin garantido:', admin.email)

  // 2. Criar usuário cliente de teste
  const clientPasswordHash = await bcrypt.hash('cliente123', 10)
  const client = await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      name: 'Cliente Demonstração',
      email: 'cliente@teste.com',
      passwordHash: clientPasswordHash,
      role: 'CLIENT'
    }
  })

  // Endereço padrão para o cliente de teste
  await prisma.address.create({
    data: {
      userId: client.id,
      recipientName: 'Cliente Demonstração',
      zipcode: '01001-000',
      street: 'Praça da Sé',
      number: '100',
      complement: 'Apto 42',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
      isDefault: true
    }
  })
  console.log('✅ Usuário Cliente e Endereço garantidos:', client.email)

  // 3. Criar Categorias
  const catPerifericos = await prisma.category.upsert({
    where: { slug: 'perifericos' },
    update: {},
    create: { name: 'Periféricos', slug: 'perifericos' }
  })

  const catMonitores = await prisma.category.upsert({
    where: { slug: 'monitores' },
    update: {},
    create: { name: 'Monitores', slug: 'monitores' }
  })

  const catHardware = await prisma.category.upsert({
    where: { slug: 'hardware' },
    update: {},
    create: { name: 'Hardware', slug: 'hardware' }
  })
  console.log('✅ Categorias criadas com sucesso.')

  // 4. Criar Produtos de Demonstração
  const demoProducts = [
    {
      categoryId: catPerifericos.id,
      name: 'Teclado Mecânico RGB Switch Blue',
      slug: 'teclado-mecanico-rgb-switch-blue',
      description: 'Teclado mecânico gamer com iluminação RGB personalizável, layout ABNT2 e switches de alta durabilidade.',
      price: 299.90,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      weightG: 850,
      lengthCm: 44,
      widthCm: 14,
      heightCm: 4
    },
    {
      categoryId: catPerifericos.id,
      name: 'Mouse Gamer 16000 DPI Sensor Óptico',
      slug: 'mouse-gamer-16000-dpi',
      description: 'Mouse ultraleve com sensor óptico de alta precisão, 6 botões programáveis e cabo paracord.',
      price: 159.90,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      weightG: 220,
      lengthCm: 18,
      widthCm: 10,
      heightCm: 5
    },
    {
      categoryId: catPerifericos.id,
      name: 'Headset Gamer 7.1 Surround Som Espacial',
      slug: 'headset-gamer-71-surround',
      description: 'Headset com almofadas memory foam, cancelamento de ruído no microfone e drivers de 50mm.',
      price: 389.00,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      weightG: 450,
      lengthCm: 22,
      widthCm: 20,
      heightCm: 10
    },
    {
      categoryId: catMonitores.id,
      name: 'Monitor Gamer 27" 165Hz IPS 1ms QHD',
      slug: 'monitor-gamer-27-165hz-ips',
      description: 'Monitor de alta fidelidade com painel IPS, resolução 2560x1440, FreeSync Premium e suporte ergonômico.',
      price: 1699.00,
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      weightG: 6200,
      lengthCm: 68,
      widthCm: 45,
      heightCm: 18
    },
    {
      categoryId: catHardware.id,
      name: 'SSD NVMe M.2 1TB Leitura 3500MB/s',
      slug: 'ssd-nvme-m2-1tb',
      description: 'Armazenamento ultra veloz PCIe Gen3x4 com dissipador térmico em alumínio grafeno.',
      price: 429.90,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
      weightG: 80,
      lengthCm: 12,
      widthCm: 8,
      heightCm: 2
    }
  ]

  for (const prod of demoProducts) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod
    })
  }

  console.log('✅ Produtos de demonstração inseridos com sucesso.')
  console.log('🎉 Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

