
export default class Utils
{
    public static Distance(a: {x: number, y: number}, b: {x: number, y: number}){
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
    }
    public static Closest<T>(target: T & {x: number, y: number}, objects: IterableIterator<T & {x: number, y: number}>){
        let closest = null
        let closestDistance = null

        for (let object of objects) {

            const distance = this.Distance(target, object)

            if(!closest) {
                closest = object
                closestDistance = distance
                continue
            }

            if(distance < closestDistance!) {
                closest = object
                closestDistance = distance
            }
        }

        return closest
    }
    public static Between (num: number, x: number, y: number) {
        return Math.min(y, Math.max(x, num))
    }
}