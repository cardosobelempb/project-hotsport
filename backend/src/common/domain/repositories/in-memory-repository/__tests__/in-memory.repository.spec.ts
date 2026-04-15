import { UUIDVO } from '@/common/domain/values-objects'
import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EntityBuild } from '../../../entities/EntityBuild'
import { NotFoundError } from '../../../errors'
import { RepositoryInMemory } from '../RepositoryInMemory'

type StubEntityProsp = {
  id: UUIDVO
  name: string
  price: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

class StubEntity {
  id: UUIDVO
  name: string
  price: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  constructor(id: UUIDVO, name: string, price: number) {
    this.id = id
    this.name = name
    this.price = price
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.deletedAt = null
  }
}

export class StubFactory implements EntityBuild<StubEntity, StubEntityProsp> {
  create(props: StubEntityProsp): StubEntity {
    // Geração de ID centralizada
    const id = UUIDVO.create()

    // Criação da entidade já validada
    return new StubEntity(id, props.name, props.price)
  }
}

class StubInMemoryRepository extends RepositoryInMemory<StubEntity> {
  constructor() {
    super()
    this.sortableFields = ['name']
  }
  protected async applyFilter(
    items: StubEntity[],
    filter?: string,
  ): Promise<StubEntity[]> {
    if (!filter) {
      return items
    }

    return items.filter(
      item => item.name.toLowerCase().includes(filter.toLowerCase()), // exemplo
    )
  }
}

describe('InmemoryRepository unit tests', () => {
  let sut: StubInMemoryRepository
  let entity: StubEntity
  let stubFactory: StubFactory
  let props: any
  let createdAt: Date
  let updatedAt: Date
  let deletedAt: Date

  beforeEach(() => {
    sut = new StubInMemoryRepository()
    createdAt = new Date()
    updatedAt = new Date()
    deletedAt = new Date()

    props = {
      name: 'test name',
      price: 10,
    }

    entity = stubFactory?.create({
      id: randomUUID(),
      createdAt,
      updatedAt,
      deletedAt,
      ...props,
    })

    stubFactory = new StubFactory()
  })

  describe('create a new entity', () => {
    it('should create a new entity', () => {
      const result = stubFactory.create(props)
      expect(result.name).toStrictEqual('test name')
    })
  })

  describe('insert', () => {
    it('should insert a new entity', async () => {
      /**
        await sut.save(props)
        const result = await sut.findById(entity.id)
        expect(result).toBeDefined()
      */

      entity = await sut.save(props)
      const result = await sut.search({ filter: 'test name' })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]?.name).toBe('test name')
      expect(result.items[0]).toStrictEqual(entity)
    })
  })

  describe('findById', () => {
    it('should throw error when id not found', async () => {
      const id = randomUUID()
      await sut['_get'](id).catch(err => {
        expect(err).toBeInstanceOf(NotFoundError)
        expect(err.path).toBe(`Entity not found using id ${id}`)
        expect(err.statusCode).toBe(404)
      })
    })

    it('should find a entity by id', async () => {
      const data = await sut.save(props)
      const result = await sut.findById(data.id.getValue())
      expect(result).toBeDefined()
      expect(result).toStrictEqual(data)
    })
  })

  describe('update', () => {
    it('should throw error when id not found', async () => {
      await sut['save'](entity).catch(err => {
        expect(err).toBeInstanceOf(NotFoundError)
        expect(err.path).toBe(`Entity not found using id ${entity.id}`)
        expect(err.statusCode).toBe(404)
      })
    })

    it('should update an entity', async () => {
      entity = await sut.save(props)
      const entityUpdated = stubFactory.create({
        id: UUIDVO.create(),
        name: 'updated name',
        price: 2000,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      const data = (entity = await sut.save(entityUpdated))

      const result = await sut.search({ filter: 'updated name' })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]?.name).toBe('updated name')
      expect(result.items[0]).toStrictEqual(data)
    })
  })

  describe('delete', () => {
    it('should throw error when id not found', async () => {
      await sut['delete'](entity).catch(err => {
        expect(err).toBeInstanceOf(NotFoundError)
        expect(err.path).toBe(`Entity not found using id ${entity.id}`)
        expect(err.statusCode).toBe(404)
      })
    })

    it('should delete an entity', async () => {
      const data = await sut.save(props)
      expect(sut['items']).toHaveLength(1)

      await sut.delete(data)
      expect(sut['items']).toHaveLength(0)
      // expect(sut['items'][0]?.deletedAt).toEqual(expect.any(Date))
      // expect(sut['items'][0]).toStrictEqual(data)
    })
  })

  describe('applayFilter', () => {
    it('should no filter when filter param is null', async () => {
      // const result = stubFactory.create(props)
      const items = [entity]

      const spyFilterMethod = vi.spyOn(items, 'filter' as any)

      const result = await sut['applyFilter'](items)

      expect(spyFilterMethod).not.toHaveBeenCalled()
      expect(result).toStrictEqual(items)
    })

    it('should filter when filter param', async () => {
      // const result = stubFactory.create(props)
      const items = [
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'test',
          price: 10,
          createdAt,
          updatedAt,
        }),
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'TEST',
          price: 20,
          createdAt,
          updatedAt,
        }),
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'fake',
          price: 30,
          createdAt,
          updatedAt,
        }),
      ]

      const spyFilterMethod = vi.spyOn(items, 'filter' as any)

      let result = await sut['applyFilter'](items, 'TEST')

      expect(spyFilterMethod).toHaveBeenCalledTimes(1)
      expect(result).toStrictEqual([items[0], items[1]])
      expect(result).toHaveLength(2)

      result = await sut['applyFilter'](items, 'test')

      expect(spyFilterMethod).toHaveBeenCalledTimes(2)
      expect(result).toStrictEqual([items[0], items[1]])
      expect(result).toHaveLength(2)

      result = await sut['applyFilter'](items, 'no-ilter')

      expect(spyFilterMethod).toHaveBeenCalledTimes(3)
      expect(result).toHaveLength(0)
    })
  })

  describe('applySort', async () => {
    it('should no sort when sort param is null', async () => {
      // const result = stubFactory.create(props)
      const items = [
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'b',
          price: 10,
          createdAt,
          updatedAt,
        }),
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'a',
          price: 20,
          createdAt,
          updatedAt,
        }),
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'c',
          price: 30,
          createdAt,
          updatedAt,
        }),
      ]

      let result = sut['applySort'](items)
      expect(result).toStrictEqual(items)

      result = sut['applySort'](items, 'id', 'asc')
      expect(result).toStrictEqual(items)
    })

    it('should sort when sort param', async () => {
      // const result = stubFactory.create(props)
      const items = [
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'b',
          price: 10,
          createdAt,
          updatedAt,
        }),
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'a',
          price: 20,
          createdAt,
          updatedAt,
        }),
        stubFactory.create({
          id: UUIDVO.create(),
          name: 'c',
          price: 30,
          createdAt,
          updatedAt,
        }),
      ]

      let result = sut['applySort'](items, 'name', 'desc')
      expect(result).toStrictEqual([items[2], items[0], items[1]])

      result = sut['applySort'](items, 'name', 'asc')
      expect(result).toStrictEqual([items[1], items[0], items[2]])
    })
  })
})

/**npm run test -- in-memory.repository.spec.ts */
