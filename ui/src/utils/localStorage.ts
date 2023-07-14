export const storageKey = 'datav.'
const storage = {
    set(key: string, value: any) {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(storageKey + key, JSON.stringify(value))
        }

    },
    get(key: string) {
        if (typeof window !== "undefined") {
            const r = window.localStorage.getItem(storageKey + key)
            if (r && r != "undefined") {
                return JSON.parse(r)
            }   
        }
    },
    remove(key: string) {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(storageKey + key)
        }
    }
}

export default storage