let adminKey = 'im.dev.'
const storage = {
    set(key: string, value: any) {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(adminKey + key, JSON.stringify(value))
        }

    },
    get(key: string) {
        if (typeof window !== "undefined") {
            const r = window.localStorage.getItem(adminKey + key)
            if (r && r != "undefined") {
                return JSON.parse(r)
            }   
        }
    },
    remove(key: string) {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(adminKey + key)
        }
    }
}

export default storage