export class Registry<T extends { name: string }> {
  private items: Map<string, T> = new Map()

  register(item: T): void {
    this.items.set(item.name, item)
  }

  get(name: string): T | undefined {
    return this.items.get(name)
  }

  getAll(): T[] {
    return Array.from(this.items.values())
  }

  has(name: string): boolean {
    return this.items.has(name)
  }

  clear(): void {
    this.items.clear()
  }
}
