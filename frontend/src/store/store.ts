import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './filterSlice';
import authReducer from './authSlice';
import manuscriptReducer from './manuscriptSlice';

export const store = configureStore({
    reducer: {
        filters: filterReducer,
        auth: authReducer,
        manuscripts: manuscriptReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;