import React, { useState, useEffect, useRef } from 'react';
import { useProductContext, Product } from '../context/ProductContext';
import { Plus, Edit2, Trash2, X, Check, Eye, LogIn, LayoutDashboard, Type, Image as LucideImage } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

export const Admin = () => {
    const { products, siteContent, addProduct, updateProduct, deleteProduct, updateSiteContent } = useProductContext();
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'products' | 'content'>('products');

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [isAdding, setIsAdding] = useState(false);
    
    const [contentForm, setContentForm] = useState(siteContent);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        setContentForm(siteContent);
    }, [siteContent]);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl text-primary">Loading...</div>;

    const isAdmin = user?.email === 'salah77sofian@gmail.com';

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="bg-surface p-12 rounded-[32px] text-center border border-border-warm shadow-sm max-w-md w-full">
                    <h1 className="font-serif text-3xl text-primary mb-4">Admin Portal</h1>
                    {user && !isAdmin ? (
                        <>
                            <p className="text-red-500 mb-8">Access denied. You are not authorized to view the control panel.</p>
                            <button onClick={() => auth.signOut()} className="w-full flex items-center justify-center gap-2 bg-background border border-border-warm text-ink py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-surface/50 transition">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-ink-soft mb-8">Please sign in to access the control panel.</p>
                            <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition">
                                <LogIn className="w-4 h-4" /> Sign In with Google
                            </button>
                        </>
                    )}
                    <Link to="/" className="mt-6 inline-block text-sm text-ink-soft underline hover:text-primary transition">Back to Site</Link>
                </div>
            </div>
        );
    }

    const handleEditClick = (product: Product) => {
        setIsEditing(product.id);
        setEditForm({ ...product });
    };

    const handleSaveEdit = async () => {
        if (editForm.id) {
            await updateProduct(editForm as Product);
        }
        setIsEditing(null);
        setEditForm({});
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
        setEditForm({});
    };

    const handleAddNew = async () => {
        if (!editForm.name || !editForm.price) return;
        await addProduct({
            name: editForm.name || '',
            price: editForm.price || '0 DZD',
            category: editForm.category || 'Cleansers',
            skinTypes: editForm.skinTypes || ['All Skin Types'],
            benefit: editForm.benefit || '',
            badge: editForm.badge || undefined,
            imageUrl: editForm.imageUrl || undefined
        });
        setIsAdding(false);
        setEditForm({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'skinTypes') {
             setEditForm(prev => ({ ...prev, skinTypes: value.split(',').map(s => s.trim()) }));
        } else {
             setEditForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setEditForm(prev => ({ ...prev, imageUrl: dataUrl }));
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContentForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveContent = async () => {
        await updateSiteContent(contentForm);
        alert('Site content updated!');
    };

    return (
        <div className="min-h-screen bg-background pt-28 px-6 pb-20">
            <div className="max-w-6xl mx-auto bg-surface rounded-[40px] overflow-hidden border border-border-warm shadow-md flex flex-col md:flex-row min-h-[70vh]">
                
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-primary/5 p-8 border-r border-border-warm/50 shrink-0">
                    <h2 className="font-serif text-2xl text-primary font-semibold mb-8">Control Panel</h2>
                    <nav className="flex flex-col gap-2">
                        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'products' ? 'bg-primary text-white' : 'text-ink hover:bg-white'}`}>
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-medium text-sm">Products</span>
                        </button>
                        <button onClick={() => setActiveTab('content')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'content' ? 'bg-primary text-white' : 'text-ink hover:bg-white'}`}>
                            <Type className="w-5 h-5" />
                            <span className="font-medium text-sm">Site Text</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="font-serif text-3xl sm:text-4xl text-primary font-semibold">
                            {activeTab === 'products' ? 'Manage Products' : 'Manage Site Content'}
                        </h1>
                        <div className="flex gap-4">
                            <Link to="/" className="flex items-center gap-2 bg-white text-primary border border-border-warm px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/5 transition shadow-sm">
                                <Eye className="w-4 h-4" /> View Site
                            </Link>
                            {activeTab === 'products' && (
                                <button onClick={() => { setIsAdding(true); setEditForm({}); }} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition shadow-sm">
                                    <Plus className="w-4 h-4" /> Add Product
                                </button>
                            )}
                        </div>
                    </div>

                    {activeTab === 'products' ? (
                        <div className="bg-white rounded-[24px] overflow-x-auto border border-border-warm/50 shadow-sm relative">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-warm bg-surface/30 text-ink-soft uppercase text-xs tracking-widest">
                                        <th className="p-5 font-semibold">Image & Name</th>
                                        <th className="p-5 font-semibold">Details</th>
                                        <th className="p-5 font-semibold">Price</th>
                                        <th className="p-5 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isAdding && (
                                        <tr className="border-b border-primary/20 bg-primary/5">
                                            <td className="p-5 align-top">
                                                <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                                                <button onClick={triggerFileInput} className="w-full mb-2 bg-white px-3 py-2 rounded-lg border border-border-warm text-sm text-ink-soft flex items-center justify-center gap-2 hover:bg-surface transition">
                                                    <LucideImage className="w-4 h-4" /> {editForm.imageUrl ? 'Image Uploaded' : 'Upload Image'}
                                                </button>
                                                {editForm.imageUrl && <img src={editForm.imageUrl} alt="preview" className="w-16 h-16 object-cover rounded mb-2 mx-auto" />}
                                                <input type="text" name="name" placeholder="Product Name" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                            </td>
                                            <td className="p-5 align-top space-y-2">
                                                <input type="text" name="category" placeholder="Category" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                <input type="text" name="benefit" placeholder="Benefit" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                <input type="text" name="skinTypes" placeholder="Skin Types (comma separated)" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                            </td>
                                            <td className="p-5 align-top space-y-2">
                                                <input type="text" name="price" placeholder="Price (DZD)" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                <input type="text" name="badge" placeholder="Badge (optional)" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                            </td>
                                            <td className="p-5 align-top text-right flex justify-end gap-2">
                                                <button onClick={handleAddNew} className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setIsAdding(false)} className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-sm"><X className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    )}
                                    {products.map(product => (
                                        <tr key={product.id} className="border-b border-border-warm/50 last:border-0 hover:bg-surface/30 transition">
                                            {isEditing === product.id ? (
                                                <>
                                                    <td className="p-5 align-top">
                                                        <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                                                        <button onClick={triggerFileInput} className="w-full mb-2 bg-white px-3 py-2 rounded-lg border border-border-warm text-sm text-ink-soft flex items-center justify-center gap-2 hover:bg-surface transition">
                                                            <LucideImage className="w-4 h-4" /> {editForm.imageUrl ? 'Change Image' : 'Upload Image'}
                                                        </button>
                                                        {editForm.imageUrl && <img src={editForm.imageUrl} alt="preview" className="w-16 h-16 object-cover rounded mb-2 mx-auto" />}
                                                        <input type="text" name="name" value={editForm.name} placeholder="Product Name" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                    </td>
                                                    <td className="p-5 align-top space-y-2">
                                                        <input type="text" name="category" value={editForm.category} placeholder="Category" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                        <input type="text" name="benefit" value={editForm.benefit} placeholder="Benefit" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                        <input type="text" name="skinTypes" value={editForm.skinTypes?.join(', ') || ''} placeholder="Skin Types" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                    </td>
                                                    <td className="p-5 align-top space-y-2">
                                                        <input type="text" name="price" value={editForm.price} placeholder="Price" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                        <input type="text" name="badge" value={editForm.badge || ''} placeholder="Badge" onChange={handleChange} className="w-full bg-white px-3 py-2 rounded-lg border border-border-warm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                    </td>
                                                    <td className="p-5 align-top text-right flex justify-end gap-2">
                                                        <button onClick={handleSaveEdit} className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm"><Check className="w-4 h-4" /></button>
                                                        <button onClick={handleCancelEdit} className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-sm"><X className="w-4 h-4" /></button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-4">
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-xl bg-border-warm" />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center font-serif text-primary/40 text-xs">IMG</div>
                                                            )}
                                                            <div>
                                                                <div className="font-serif text-lg text-ink leading-tight">{product.name}</div>
                                                                {product.badge && <span className="inline-block mt-1 bg-secondary/10 text-secondary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">{product.badge}</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 py-4">
                                                        <div className="text-ink-soft text-sm font-medium mb-1">{product.category}</div>
                                                        <div className="text-xs text-ink-soft/70 line-clamp-1">{product.benefit}</div>
                                                    </td>
                                                    <td className="p-5 font-semibold text-primary">{product.price}</td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex justify-end">
                                                            <button onClick={() => handleEditClick(product)} className="p-2 text-ink-soft hover:text-primary transition bg-surface hover:bg-primary/10 rounded-lg mr-2"><Edit2 className="w-4 h-4" /></button>
                                                            <button onClick={() => deleteProduct(product.id)} className="p-2 text-ink-soft hover:text-red-600 transition bg-surface hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {products.length === 0 && !isAdding && (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-ink-soft">No products found. Add one above!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[24px] p-8 border border-border-warm/50 shadow-sm max-w-2xl">
                            <h3 className="font-serif text-2xl text-ink mb-6 border-b border-border-warm pb-4">Site Customization</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-serif text-xl mb-4 text-primary">Hero Section</h4>
                                    <label className="block text-sm font-semibold uppercase tracking-wider text-ink-soft mb-2">Headline</label>
                                    <input 
                                        type="text" 
                                        name="heroTitle" 
                                        value={contentForm.heroTitle} 
                                        onChange={handleContentChange} 
                                        className="w-full bg-surface/50 px-4 py-3 rounded-xl border border-border-warm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition font-serif text-lg mb-4"
                                    />
                                    <p className="text-xs text-ink-soft/70 mb-4 block">Use \n to create a line break.</p>
                                    <label className="block text-sm font-semibold uppercase tracking-wider text-ink-soft mb-2">Subtitle</label>
                                    <textarea 
                                        name="heroSubtitle" 
                                        value={contentForm.heroSubtitle} 
                                        onChange={handleContentChange} 
                                        rows={4}
                                        className="w-full bg-surface/50 px-4 py-3 rounded-xl border border-border-warm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition font-sans text-sm resize-none"
                                    />
                                </div>
                                <div className="border-t border-border-warm pt-6">
                                    <h4 className="font-serif text-xl mb-4 text-primary">Story Section</h4>
                                    <label className="block text-sm font-semibold uppercase tracking-wider text-ink-soft mb-2">Story Headline</label>
                                    <input 
                                        type="text" 
                                        name="storyTitle" 
                                        value={contentForm.storyTitle} 
                                        onChange={handleContentChange} 
                                        className="w-full bg-surface/50 px-4 py-3 rounded-xl border border-border-warm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition font-serif text-lg mb-4"
                                    />
                                    <label className="block text-sm font-semibold uppercase tracking-wider text-ink-soft mb-2">Story Paragraph 1</label>
                                    <textarea 
                                        name="storyText1" 
                                        value={contentForm.storyText1} 
                                        onChange={handleContentChange} 
                                        rows={4}
                                        className="w-full bg-surface/50 px-4 py-3 rounded-xl border border-border-warm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition font-sans text-sm resize-none mb-4"
                                    />
                                    <label className="block text-sm font-semibold uppercase tracking-wider text-ink-soft mb-2">Story Paragraph 2</label>
                                    <textarea 
                                        name="storyText2" 
                                        value={contentForm.storyText2} 
                                        onChange={handleContentChange} 
                                        rows={4}
                                        className="w-full bg-surface/50 px-4 py-3 rounded-xl border border-border-warm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition font-sans text-sm resize-none"
                                    />
                                </div>
                                <button 
                                    onClick={handleSaveContent}
                                    className="bg-primary text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition shadow-sm w-full md:w-auto mt-4"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
