import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';


const http = axios.create({
    baseURL: process.env.API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },




},




);

export default http;