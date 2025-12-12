export interface Subcategory {
    id: string;
    name: string;
    category_id?: string;
}

export interface Category {
    id: string;
    name: string;
    icon?: string;
    subcategories: Subcategory[];
}

export interface Location {
    id: string;
    name: string;
    latitude: number | string;
    longitude: number | string;
    description?: string;
    category_id?: string;
    subcategory_id?: string;
    condition?: string;
    address?: string;
    dusun?: string;
    contact?: string;
    color?: string;
    images?: string[];
    updated_at?: string;
}

export interface LocationReport {
    id: string;
    location_id?: string;
    full_name: string;
    address: string;
    phone: string;
    condition: string;
    image_url?: string;
    description?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}
