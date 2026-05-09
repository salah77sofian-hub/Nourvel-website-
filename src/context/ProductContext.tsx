import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';

export interface Product {
    id: string; // Changed to string for Firestore DOC ID
    name: string;
    price: string;
    category: string;
    skinTypes: string[];
    benefit: string;
    badge?: string;
    imageUrl?: string;
}

export interface SiteContent {
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyText1: string;
    storyText2: string;
}

const defaultSiteContent: SiteContent = {
    heroTitle: "Skincare born\nfrom Algerian soil.",
    heroSubtitle: "Nourvel blends centuries of Algerian botanical wisdom with modern clean formulas — made for your skin, made right here.",
    storyTitle: "Made in Algeria.\nMade with purpose.",
    storyText1: "Nourvel was born from a simple truth: Algerian women deserve skincare that was made for them, using ingredients that grow in their own land. Our founder spent three years working with Algerian botanists, dermatologists, and local farmers before the first formula was created.",
    storyText2: "Every Nourvel product is manufactured in our lab in Algiers, third-party tested, and certified safe for all skin types. We don't import trends. We formulate solutions — rooted in Algerian nature, proven by science."
};

interface DataContextType {
    products: Product[];
    siteContent: SiteContent;
    loading: boolean;
    addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (p: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    updateSiteContent: (content: Partial<SiteContent>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const ProductProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            const loadedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(loadedProducts);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching products:', error);
            setLoading(false);
        });

        const unsubscribeSiteContent = onSnapshot(doc(db, 'site', 'content'), (docSnap) => {
            if (docSnap.exists()) {
                setSiteContent({ ...defaultSiteContent, ...docSnap.data() });
            } else {
                // If the doc doesn't exist yet, we stick to defaultSiteContent
            }
        });

        return () => {
            unsubscribeProducts();
            unsubscribeSiteContent();
        };
    }, []);

    const addProduct = async (p: Omit<Product, 'id'>) => {
        try {
            const newDocRef = doc(collection(db, 'products'));
            await setDoc(newDocRef, p);
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    };

    const updateProduct = async (updated: Product) => {
        try {
            const { id, ...data } = updated;
            await updateDoc(doc(db, 'products', id), data as any);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'products', id));
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };

    const updateSiteContent = async (content: Partial<SiteContent>) => {
        try {
            const docRef = doc(db, 'site', 'content');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, content);
            } else {
                await setDoc(docRef, { ...defaultSiteContent, ...content });
            }
        } catch (error) {
            console.error('Error updating site content:', error);
            throw error;
        }
    }

    return (
        <DataContext.Provider value={{ products, siteContent, loading, addProduct, updateProduct, deleteProduct, updateSiteContent }}>
            {children}
        </DataContext.Provider>
    );
};

export const useProductContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useProductContext must be used within ProductProvider");
    return context;
};
