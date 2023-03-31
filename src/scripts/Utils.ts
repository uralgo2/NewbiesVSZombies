
export default class Utils
{
    public static Random(seed: string = '') {
        let x = 0
        let y = 0
        let z = 0
        let w = 0

        function next() {
            const t = x ^ (x << 11)
            x = y
            y = z
            z = w
            w ^= ((w >>> 19) ^ t ^ (t >>> 8)) >>> 0
            return Math.abs(w / 0x100000000)
        }

        for (let k = 0; k < seed.length + 64; k++) {
            x ^= seed.charCodeAt(k) | 0
            next()
        }

        for(let i = 0; i < 128; i++)
            next()

        return next

    }
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