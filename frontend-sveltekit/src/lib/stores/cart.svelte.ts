import { browser } from '$app/environment';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    brand: string;
    sku?: string;
}

class CartStore {
    items = $state<CartItem[]>([]);

    constructor() {
        if (browser) {
            const stored = localStorage.getItem('cart');
            if (stored) {
                this.items = JSON.parse(stored);
            }
        }
    }

    save() {
        if (browser) {
            localStorage.setItem('cart', JSON.stringify(this.items));
        }
    }

    addItem(item: Omit<CartItem, 'quantity'>) {
        const existing = this.items.find((i) => i.id === item.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }
        this.save();
    }

    removeItem(id: string) {
        this.items = this.items.filter((i) => i.id !== id);
        this.save();
    }

    updateQuantity(id: string, delta: number) {
        const item = this.items.find((i) => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.save();
            }
        }
    }

    clear() {
        this.items = [];
        this.save();
    }

    get total() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    get count() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
}

export const cart = new CartStore();
