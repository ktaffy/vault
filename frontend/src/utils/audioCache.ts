class AudioCacheManager {
    private cache: Map<string, any>;

    constructor() {
        this.cache = new Map();
    }

    set(url: string, player: any) {
        this.cache.set(url, player);
    }

    get(url: string) {
        return this.cache.get(url);
    }

    has(url: string) {
        return this.cache.has(url);
    }

    clear() {
        this.cache.forEach((player) => {
            try {
                player.pause();
            } catch (error) {
            }
        });
        this.cache.clear();
    }

    forEach(callback: (player: any, url: string) => void) {
        this.cache.forEach(callback);
    }

    cleanup() {
        const deadUrls: string[] = [];

        this.cache.forEach((player, url) => {
            try {
                if (player.playing === undefined) {
                    deadUrls.push(url);
                }
            } catch (error) {
                deadUrls.push(url);
            }
        });

        deadUrls.forEach(url => {
            this.cache.delete(url);
        });

        if (deadUrls.length > 0) {
            console.log(`Cleaned up ${deadUrls.length} dead audio players`);
        }
    }
}

export const audioCache = new AudioCacheManager();