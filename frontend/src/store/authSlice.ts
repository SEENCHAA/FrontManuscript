import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

interface UserData {
    login?: string;
    role?: string;
    id?: number;
}

interface AuthState {
    user: UserData | null;
    isAuth: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuth: false,
    isLoading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/login',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.users.loginCreate(data);
            
            const { token, role } = response.data; 
            
            if (!token) {
                return rejectWithValue('Сервер не вернул токен');
            }

            localStorage.setItem('token', token);

            
            return { 
                login: data.username, 
                role: role 
            }; 
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.error || 'Ошибка входа');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.users.registerCreate(data);
            return response.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.error || 'Ошибка регистрации');
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (!token) return rejectWithValue('Нет токена');
        
        try {
            
            const response = await api.instance.get('/users/me'); 

            const user = response.data;
            
            
            const userId = user.id || user.ID;
            const userLogin = user.username || user.login;
            const userRole = user.role || user.Role;

            if (!userId) {
                localStorage.removeItem('token');
                return rejectWithValue('Данные пользователя не получены');
            }

            
            return {
                id: userId,
                login: userLogin, 
                role: userRole
            }; 
        } catch(e) {
             localStorage.removeItem('token');
             return rejectWithValue('Токен недействителен');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.user = null;
            state.isAuth = false;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuth = true;
            state.user = action.payload;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
        builder.addCase(checkAuth.fulfilled, (state, action) => {
            state.isAuth = true;
            state.user = action.payload;
        });
        builder.addCase(checkAuth.rejected, (state) => {
            state.isAuth = false;
            state.user = null;
            localStorage.removeItem('token');
        });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;