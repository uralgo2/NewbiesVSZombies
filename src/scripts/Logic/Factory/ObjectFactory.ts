export interface ObjectFactory<TValue> {
    make(...args: any[]): TValue
    add(...args: any[]): TValue
}