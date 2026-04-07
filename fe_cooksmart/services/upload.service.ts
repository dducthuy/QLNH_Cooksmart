import http from '@/lib/http';
import { UploadResponse } from '@/types/upload';

export const uploadService = {
    /**
     * Tải ảnh lên Cloudinary qua Backend
     * @param file Đối tượng File lấy từ input
     * @returns Thông tin ảnh (URL, filename, size)
     */
    async uploadImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('image', file); // 'image' phải khớp với tên trong backend (uploadCloud.single('image'))

        const response = await http.post<UploadResponse>('/upload/single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
