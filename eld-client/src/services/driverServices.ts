import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

export const registerDriver = async (driverData: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/`, driverData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

export const loginDriver = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login/`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Login failed' };
    }
  };

export const verifyToken = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/verify-token/`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Verification failed' };
  }
};

export const logoutDriver = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/logout/`, {}, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Logout failed' };
    }
  };