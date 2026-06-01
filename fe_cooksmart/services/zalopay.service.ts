import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const zalopayService = {
  createPayment: async (id_hoa_don: string, amount: number) => {
    const response = await axios.post(`${API_URL}/zalopay/create`, {
      id_hoa_don,
      amount
    });
    return response.data;
  }
};
