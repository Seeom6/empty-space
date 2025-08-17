import { Injectable } from "@nestjs/common";
import axios, { AxiosRequestConfig } from "axios"
@Injectable()
export class AxiosService {
    constructor(){}

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<{data: T, status: number}>{
        const response = await axios.get<T>(url, config)
        
        return {
            data: response.data,
            status: response.status
        }
    }

        async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{data: T, status: number}>{
        const response = await axios.post(url, data, config)
        return {
            data: response.data,
            status: response.status
        }
    }
}