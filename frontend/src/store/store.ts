import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './filterSlice';

export const store = configureStore({
    reducer: {
        filters: filterReducer,
    },
});

// Типы для использования в приложении
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;