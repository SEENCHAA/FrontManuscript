import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
    searchTerm: string;
    minYear: string;
    maxYear: string;
}

// Начальное состояние (пустые фильтры)
const initialState: FilterState = {
    searchTerm: '',
    minYear: '',
    maxYear: '',
};

const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload;
        },
        setMinYear(state, action: PayloadAction<string>) {
            state.minYear = action.payload;
        },
        setMaxYear(state, action: PayloadAction<string>) {
            state.maxYear = action.payload;
        },
        // Можно добавить сброс фильтров
        resetFilters(state) {
            state.searchTerm = '';
            state.minYear = '';
            state.maxYear = '';
        }
    },
});

export const { setSearchTerm, setMinYear, setMaxYear, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;