/**
 * WatchedList rastreia alterações em uma coleção
 * com base em uma chave única e comparação semântica.
 */
export abstract class WatchedListAbstract<T> {
  protected currentItems: Map<string, T>;
  private readonly initialItems: Map<string, T>;

  private addedItems: Map<string, T>;
  private removedItems: Map<string, T>;
  private updatedItems: Map<string, { before: T; after: T }>;

  protected abstract getItemKey(item: T): string;

  /**
   * Compara dois itens semanticamente.
   * Deve retornar true se forem considerados equivalentes.
   */
  protected abstract compareItems(a: T, b: T): boolean;

  constructor(initialItems: T[] = []) {
    const map = this.toMap(initialItems);

    this.currentItems = new Map(map);
    this.initialItems = new Map(map);
    this.addedItems = new Map();
    this.removedItems = new Map();
    this.updatedItems = new Map();
  }

  // -----------------------------------------------------
  // Conversões
  // -----------------------------------------------------

  private toMap(items: T[]): Map<string, T> {
    return new Map(items.map(item => [this.getItemKey(item), item]));
  }

  // -----------------------------------------------------
  // Consultas públicas
  // -----------------------------------------------------

  public getItems(): T[] {
    return [...this.currentItems.values()];
  }

  public getAddedItems(): T[] {
    return [...this.addedItems.values()];
  }

  public getRemovedItems(): T[] {
    return [...this.removedItems.values()];
  }

  public getUpdatedItems(): Array<{ before: T; after: T }> {
    return [...this.updatedItems.values()];
  }

  // -----------------------------------------------------
  // Regras internas
  // -----------------------------------------------------

  private existedInitially(key: string): boolean {
    return this.initialItems.has(key);
  }

  private isNewItem(key: string): boolean {
    return this.addedItems.has(key);
  }

  private wasRemoved(key: string): boolean {
    return this.removedItems.has(key);
  }

  // -----------------------------------------------------
  // Mutação
  // -----------------------------------------------------

  public add(item: T): void {
    const key = this.getItemKey(item);
    const current = this.currentItems.get(key);

    // Caso exista, verifica se houve alteração semântica
    if (current && !this.compareItems(current, item)) {
      this.trackUpdate(key, current, item);
    }

    if (this.wasRemoved(key)) {
      this.removedItems.delete(key);
    }

    if (!this.existedInitially(key) && !this.isNewItem(key)) {
      this.addedItems.set(key, item);
    }

    this.currentItems.set(key, item);
  }

  public remove(item: T): void {
    const key = this.getItemKey(item);

    this.currentItems.delete(key);
    this.updatedItems.delete(key);

    if (this.isNewItem(key)) {
      this.addedItems.delete(key);
      return;
    }

    if (!this.wasRemoved(key)) {
      this.removedItems.set(key, item);
    }
  }

  public update(items: T[]): void {
    const nextState = this.toMap(items);

    this.recalculateDiffs(nextState);
    this.currentItems = nextState;
  }

  /**
 * Registra alteração semântica de um item
 */
private trackUpdate(
  key: string,
  before: T,
  after: T
): void {
  // Evita registrar update de item recém-adicionado
  if (this.addedItems.has(key)) {
    return;
  }

  this.updatedItems.set(key, { before, after });
}

  // -----------------------------------------------------
  // Diferenças
  // -----------------------------------------------------

  private recalculateDiffs(next: Map<string, T>): void {
    this.addedItems.clear();
    this.removedItems.clear();
    this.updatedItems.clear();

    next.forEach((nextItem, key) => {
      const current = this.currentItems.get(key);

      if (!current && !this.existedInitially(key)) {
        this.addedItems.set(key, nextItem);
        return;
      }

      if (current && !this.compareItems(current, nextItem)) {
        this.updatedItems.set(key, { before: current, after: nextItem });
      }
    });

    this.currentItems.forEach((currentItem, key) => {
      if (!next.has(key) && this.existedInitially(key)) {
        this.removedItems.set(key, currentItem);
      }
    });
  }
}

/**
 interface Produto {
  id: string;
  nome: string;
  preco: number;
}

class ListaProdutos extends WatchedList<Produto> {
  protected getItemKey(item: Produto): string {
    return item.id;
  }

  protected compareItems(a: Produto, b: Produto): boolean {
    return a.nome === b.nome && a.preco === b.preco;
  }
}

const lista = new ListaProdutos([
  { id: "1", nome: "Caneta", preco: 2 }
]);

lista.add({ id: "1", nome: "Caneta Azul", preco: 2 });

lista.getUpdatedItems();
/*
[
  {
    before: { id: "1", nome: "Caneta", preco: 2 },
    after:  { id: "1", nome: "Caneta Azul", preco: 2 }
  }
]
*/
