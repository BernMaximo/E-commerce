import { prisma } from '../../lib/prisma.js'
import { CalculateShippingInput } from './shipping.schemas.js'

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export interface ShippingOption {
  code: 'PAC' | 'SEDEX'
  name: string
  price: number
  deliveryDays: number
  description: string
}

export class ShippingService {
  async getAddressByCep(zipcode: string): Promise<ViaCepResponse> {
    const cleanCep = zipcode.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos numéricos.')
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        throw new Error('Falha ao comunicar com o serviço de CEP.')
      }

      const data = (await response.json()) as ViaCepResponse

      if (data.erro) {
        throw new Error('CEP não encontrado na base de dados dos Correios.')
      }

      return data
    } catch (err: any) {
      if (err.message && err.message.includes('CEP não encontrado')) {
        throw err
      }
      // Fallback gracioso caso a API dos Correios/ViaCEP esteja temporariamente fora do ar
      return {
        cep: cleanCep,
        logradouro: 'Logradouro não identificado',
        complemento: '',
        bairro: 'Centro',
        localidade: 'São Paulo',
        uf: 'SP'
      }
    }
  }

  async calculateShipping(input: CalculateShippingInput) {
    const address = await this.getAddressByCep(input.zipcode)

    // Busca as dimensões e pesos de todos os produtos do carrinho
    const productIds = input.items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        weightG: true,
        lengthCm: true,
        widthCm: true,
        heightCm: true
      }
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    let totalWeightG = 0
    let totalCubicVolumeCm3 = 0

    for (const item of input.items) {
      const prod = productMap.get(item.productId)
      if (!prod) {
        throw new Error(`Produto não localizado para cotação: ${item.productId}`)
      }
      totalWeightG += prod.weightG * item.quantity
      totalCubicVolumeCm3 += prod.lengthCm * prod.widthCm * prod.heightCm * item.quantity
    }

    const physicalWeightKg = Math.max(totalWeightG / 1000, 0.3)
    const volumetricWeightKg = totalCubicVolumeCm3 / 6000
    const finalWeightKg = Math.max(physicalWeightKg, volumetricWeightKg)

    const uf = address.uf.toUpperCase()

    // Tabela regional de frete por UF
    let basePac = 16.50
    let baseSedex = 28.00
    let pacDays = 5
    let sedexDays = 2

    if (['SP', 'RJ', 'MG', 'ES'].includes(uf)) {
      basePac = 15.00
      baseSedex = 25.00
      pacDays = 4
      sedexDays = 2
    } else if (['PR', 'SC', 'RS'].includes(uf)) {
      basePac = 21.00
      baseSedex = 36.00
      pacDays = 6
      sedexDays = 3
    } else if (['DF', 'GO', 'MT', 'MS'].includes(uf)) {
      basePac = 24.50
      baseSedex = 42.00
      pacDays = 7
      sedexDays = 3
    } else if (['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'PI', 'MA'].includes(uf)) {
      basePac = 29.00
      baseSedex = 49.00
      pacDays = 8
      sedexDays = 4
    } else {
      // Região Norte (AM, PA, RO, AC, RR, AP, TO)
      basePac = 35.00
      baseSedex = 59.00
      pacDays = 11
      sedexDays = 5
    }

    const pacPrice = Number((basePac + finalWeightKg * 4.2).toFixed(2))
    const sedexPrice = Number((baseSedex + finalWeightKg * 6.5).toFixed(2))

    const options: ShippingOption[] = [
      {
        code: 'PAC',
        name: 'PAC (Econômico)',
        price: pacPrice,
        deliveryDays: pacDays,
        description: `Entrega econômica estimada em até ${pacDays} dias úteis`
      },
      {
        code: 'SEDEX',
        name: 'Sedex (Expresso)',
        price: sedexPrice,
        deliveryDays: sedexDays,
        description: `Entrega rápida prioritária estimada em até ${sedexDays} dias úteis`
      }
    ]

    return {
      destination: {
        zipcode: address.cep,
        city: address.localidade,
        state: address.uf,
        street: address.logradouro,
        neighborhood: address.bairro
      },
      package: {
        totalWeightKg: Number(physicalWeightKg.toFixed(2)),
        effectiveWeightKg: Number(finalWeightKg.toFixed(2))
      },
      options
    }
  }
}

export const shippingService = new ShippingService()

