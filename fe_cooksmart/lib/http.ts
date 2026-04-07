import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from '@/lib/token';

class Http {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: "http://localhost:5000/api",
            timeout: 60000,
            headers: { 'Content-Type': 'application/json' },
        });

        // Request Interceptor: Tự động đính kèm token vào header
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = getToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor: Xử lý lỗi tập trung
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token hết hạn hoặc không hợp lệ → xóa token
                    removeToken();
                    // Lưu ý: Không tự ý redirect ở đây để UI (như Login form) có cơ hội hiển thị lỗi!
                }
                return Promise.reject(error);
            }
        );
    }

    get<T>(url: string, config?: any) {
        return this.instance.get<T>(url, config);
    }

    post<T>(url: string, data?: any, config?: any) {
        return this.instance.post<T>(url, data, config);
    }

    put<T>(url: string, data?: any, config?: any) {
        return this.instance.put<T>(url, data, config);
    }

    patch<T>(url: string, data?: any, config?: any) {
        return this.instance.patch<T>(url, data, config);
    }

    delete<T>(url: string, config?: any) {
        return this.instance.delete<T>(url, config);
    }
}

const http = new Http();
export default http;