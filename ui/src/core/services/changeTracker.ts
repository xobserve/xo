
export class ChangeTracker {
    private hasChanges : () => boolean | null = null

    init() {
        // register listener for browser refresh etc
        window.onbeforeunload = () => { 
            if (this.hasChanges()) {
                return 'There are unsaved changes to this dashboard' 
            } else {
                return undefined
            }
        };

        //before url routed happened, check whether can route to
        // this is implemented in layouts/Header/inde.xtsx
    }

    register(f : () => boolean) {
        this.hasChanges = f
    }

    unregister() {
        this.hasChanges = null
    }

    // indicates whether we can leave the current page
    canLeave() {
        if (this.hasChanges) {
            return !this.hasChanges()
        }

        return true
    }
} 

const tracker = new ChangeTracker()
tracker.init()

export default tracker