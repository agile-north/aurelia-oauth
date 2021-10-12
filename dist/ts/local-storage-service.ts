export default class LocalStorageService {
    public isStorageSupported(): boolean {
        return window.localStorage !== undefined;
    }

    public set<T>(key: string, object: T): void {
        window.localStorage.setItem(this.makeKey(key), JSON.stringify(object));
    }

    public get<T>(key: string): T {
        return JSON.parse(window.localStorage.getItem(this.makeKey(key)));
    }

    public remove(key: string): void {
        window.localStorage.removeItem(this.makeKey(key));
    }

    private makeKey(key: string): string {
        return `${window.location.pathname}/${key}`;
    }
}