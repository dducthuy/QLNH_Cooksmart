'use client';

import { useState, useEffect } from 'react';
import { uploadService } from '@/services/upload.service';
import { Camera, Loader2, Save, X, CheckCircle2 } from 'lucide-react';

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'image' | 'select' | 'textarea' | 'checkbox';
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: any }[]; // Cho trường 'select'
}

interface DynamicFormProps {
    title: string;
    fields: FormField[];
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function DynamicForm({ title, fields, initialData, onSubmit, onCancel, isLoading: isExternalLoading }: DynamicFormProps) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (key: string, value: any) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const result = await uploadService.uploadImage(file);
            if (result.status === 'success') {
                handleChange(key, result.data.url);
            }
        } catch (error) {
            console.error("Lỗi khi up ảnh:", error);
            alert("Tải ảnh thất bại!");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await onSubmit(formData);
        } catch (error) {
            console.error("Lỗi khi submit form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBase = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#d9a01e] focus:ring-2 focus:ring-[#d9a01e]/10 transition-all placeholder:text-gray-400";

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider">
                        {title}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Điền đầy đủ thông tin bên dưới</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fields.map((field) => (
                        <div key={field.key} className={field.type === 'textarea' || field.type === 'image' ? 'md:col-span-2' : ''}>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 pl-0.5">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>

                            {/* Text Input */}
                            {field.type === 'text' && (
                                <input
                                    type="text"
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className={inputBase}
                                />
                            )}

                            {/* Number Input */}
                            {field.type === 'number' && (
                                <input
                                    type="number"
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className={inputBase}
                                />
                            )}

                            {/* Textarea */}
                            {field.type === 'textarea' && (
                                <textarea
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className={`${inputBase} resize-none`}
                                />
                            )}

                            {/* Select */}
                            {field.type === 'select' && (
                                <select
                                    required={field.required}
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className={`${inputBase} cursor-pointer appearance-none`}
                                >
                                    <option value="">{field.placeholder || "Chọn một giá trị"}</option>
                                    {field.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Image Upload */}
                            {field.type === 'image' && (
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <div className="w-full h-36 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#d9a01e]/50 group-hover:bg-[#d9a01e]/5">
                                            {formData[field.key] ? (
                                                <img
                                                    src={formData[field.key]}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="text-gray-400 flex flex-col items-center gap-1.5">
                                                    {isUploading
                                                        ? <Loader2 size={24} className="animate-spin text-[#d9a01e]" />
                                                        : <Camera size={24} className="text-gray-300 group-hover:text-[#d9a01e] transition-colors" />
                                                    }
                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                                        {isUploading ? 'Đang tải ảnh...' : 'Bấm để tải ảnh lên'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, field.key)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest pl-1 italic">
                                        Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)
                                    </p>
                                </div>
                            )}

                            {/* Checkbox */}
                            {field.type === 'checkbox' && (
                                <label className="flex items-center gap-2.5 py-2.5 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData[field.key] ? 'bg-[#d9a01e] border-[#d9a01e]' : 'bg-white border-gray-300 group-hover:border-[#d9a01e]/50'}`}>
                                        {formData[field.key] && <CheckCircle2 size={13} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData[field.key] || false}
                                        onChange={(e) => handleChange(field.key, e.target.checked)}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                                        Đang hoạt động / Sẵn sàng phục vụ
                                    </span>
                                </label>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting || isExternalLoading}
                        className="flex-1 px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all border border-gray-200 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isUploading || isExternalLoading}
                        className="flex-1 px-6 py-2.5 rounded-xl font-black bg-linear-to-r from-[#d9a01e] to-[#f8b500] text-white hover:shadow-lg hover:shadow-[#d9a01e]/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting || isExternalLoading ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <>
                                <Save size={15} />
                                <span>Lưu Lại</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
