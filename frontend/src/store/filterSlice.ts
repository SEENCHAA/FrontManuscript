import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
    searchTerm: string;
}

// Начальное состояние
const initialState: FilterState = {
    searchTerm: '',
};

const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload;
        },
        resetFilters(state) {
            state.searchTerm = '';
        }
    },
});

export const { setSearchTerm, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;