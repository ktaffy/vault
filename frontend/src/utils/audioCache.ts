class AudioCacheManager {
    private cache: Map<string, any>;
    private maxSize: number;

    constructor(maxSize: number = 20) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    set(url: string, player: any) {
        if (this.cache.size >= this.maxSize && !this.cache.has(url)) {
            const firstEntry = this.cache.keys().next();
            if (!firstEntry.done && firstEntry.value) {
                const oldestUrl = firstEntry.value;
                const oldestPlayer = this.cache.get(oldestUrl);
                try {
                    if (oldestPlayer && oldestPlayer.playing) {
                        oldestPlayer.pause();
                    }
                } catch (error) {
                    // Ignore errors from dead players
                }
                this.cache.delete(oldestUrl);
            }
        }
        this.cache.delete(url);
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