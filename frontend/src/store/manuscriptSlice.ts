import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

interface ManuscriptState {
    app_id?: number;
    count: number;
    letters: any[];
    manuscriptData: any;
    orders: any[];
    isDraft: boolean;
    error: string | null;
    isLoading: boolean;
}

const initialState: ManuscriptState = {
    app_id: undefined,
    count: 0,
    letters: [],
    manuscriptData: {},
    orders: [],
    isDraft: false,
    error: null,
    isLoading: false,
};

const normalizeManuscript = (data: any) => {
    if (!data) return null;
    
    const rawLetters = data.letters || data.Letters || [];
    
    const letters = rawLetters.map((l: any) => {
        const info = l.letter || l.Letter || l; 
        
        return {
            letter_id: l.letter_id || l.LetterID || l.letterId || info.id || info.ID,
            quantity: (l.quantity !== undefined) ? l.quantity : (l.Quantity !== undefined ? l.Quantity : 1),
            name: info.name || info.Name || "Unknown",
            description: info.description || info.Description || "",
            image_url: l.image_url || l.ImageURL || info.image_url || info.ImageURL || ""
        };
    });

    const normalizeDate = (d: string) => {
        if (!d || d.startsWith('0001-01-01')) return null;
        return d;
    };

    return {
        id: data.id || data.ID,
        user_id: data.user_id || data.UserID,
        username: data.username || data.Username || "Неизвестный",
        status: data.status || data.Status,
        manuscript_text: data.manuscript_text || data.ManuscriptText || "",
        created_at: normalizeDate(data.created_at || data.CreatedAt),
        finished_at: normalizeDate(data.finished_at || data.FinishedAt),
        submitted_at: normalizeDate(data.submitted_at || data.SubmittedAt),
        moderator_id: (data.moderator_id === 0) ? null : (data.moderator_id || data.ModeratorID),
        moderator_name: data.moderator_name || data.ModeratorName,
        calculated_period: data.calculated_period || data.CalculatedPeriod,
        letters: letters
    };
};

export const fetchDraftStatus = createAsyncThunk(
    'manuscripts/fetchDraftStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.manuscripts.basketList();
            return response.data;
        } catch (e: any) {
            if (e.response && e.response.status === 404) return null;
            return rejectWithValue(null);
        }
    }
);


export const fetchDraft = createAsyncThunk(
    'manuscripts/fetchDraft',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.manuscripts.basketList();
            // @ts-ignore
            const draftId = response.data.manuscript_id || response.data.manuscriptId;
            if (draftId) {
                const detailResponse = await api.manuscripts.manuscriptsDetail(draftId);
                return normalizeManuscript(detailResponse.data);
            }
            return null;
        } catch (e: any) {
            if (e.response && e.response.status === 404) return null;
            return rejectWithValue(e.response?.data?.error);
        }
    }
);

export const fetchMyOrders = createAsyncThunk(
    'manuscripts/fetchMyOrders',
    async (filters: { status?: string, start?: string, end?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await api.manuscripts.manuscriptsList(filters);
            const list = Array.isArray(response.data) ? response.data : [];
            return list.map(normalizeManuscript);
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.error);
        }
    }
);

export const getManuscriptDetail = createAsyncThunk(
    'manuscripts/getDetail',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.manuscripts.manuscriptsDetail(id);
            return normalizeManuscript(response.data);
        } catch (e: any) {
            return rejectWithValue('Ошибка загрузки заявки');
        }
    }
);

export const addLetterToManuscript = createAsyncThunk(
    'manuscripts/addLetter',
    async (letterId: number, { dispatch, rejectWithValue }) => {
        try {
        
            await api.letters.manuscriptCreate(letterId, { quantity: 1 });
            
            dispatch(fetchDraft()); 
        } catch (e: any) {
            return rejectWithValue('Ошибка добавления');
        }
    }
);

export const removeLetter = createAsyncThunk(
    'manuscripts/removeLetter',
    async ({ mId, lId }: { mId: number, lId: number }, { dispatch }) => {
        await api.manuscripts.lettersDelete(mId, lId);
        dispatch(getManuscriptDetail(mId));
        dispatch(fetchDraft()); // Обновляем и глобальный счетчик
    }
);

export const updateQty = createAsyncThunk(
    'manuscripts/updateQty',
    async ({ mId, lId, qty }: { mId: number, lId: number, qty: number }, { dispatch }) => {
        await api.manuscripts.lettersUpdate(mId, lId, { quantity: qty });
        dispatch(getManuscriptDetail(mId));
        dispatch(fetchDraft()); 
    }
);

export const updateManuscriptText = createAsyncThunk(
    'manuscripts/updateText',
    async ({ id, text }: { id: number, text: string }, { dispatch, rejectWithValue }) => {
        try {
            // @ts-ignore
            await api.manuscripts.manuscriptsUpdate(id, { manuscript_text: text });
            dispatch(getManuscriptDetail(id));
        } catch (e: any) {
            return rejectWithValue('Ошибка сохранения текста');
        }
    }
);

export const deleteManuscript = createAsyncThunk(
    'manuscripts/delete',
    async (id: number, { dispatch, rejectWithValue }) => {
        try {
            await api.manuscripts.manuscriptsDelete(id);
            dispatch(clearManuscriptState());
            return id;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.error || 'Ошибка удаления');
        }
    }
);

export const confirmManuscript = createAsyncThunk(
    'manuscripts/confirm',
    async (id: number, { dispatch, rejectWithValue }) => {
        try {
            await api.manuscripts.submitUpdate(id);
            dispatch(getManuscriptDetail(id));
            dispatch(fetchDraft()); // Обновляем статус
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.error || 'Ошибка подтверждения');
        }
    }
);

export const moderateManuscript = createAsyncThunk(
    'manuscripts/moderate',
    async ({ id, status }: { id: number, status: string }, { dispatch, rejectWithValue }) => {
        try {
            await api.manuscripts.moderationUpdate(id, { status });
            dispatch(fetchMyOrders({})); 
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.error || 'Ошибка модерации');
        }
    }
);

const manuscriptSlice = createSlice({
    name: 'manuscripts',
    initialState,
    reducers: {
        clearManuscriptState: (state) => {
            state.app_id = undefined;
            state.count = 0;
            state.letters = [];
            state.manuscriptData = {};
            state.orders = [];
            state.isDraft = false;
        }
    },
    extraReducers: (builder) => {
        
        builder.addCase(fetchDraftStatus.fulfilled, (state, action) => {
            // @ts-ignore
            state.app_id = action.payload?.manuscript_id;
            // @ts-ignore
            state.count = action.payload?.letter_count;
        });

        // ПОЛНАЯ КОРЗИНА (Используем её для точного подсчета)
        builder.addCase(fetchDraft.fulfilled, (state, action) => {
            if (action.payload) {
                state.app_id = action.payload.id;
                // @ts-ignore
                state.letters = action.payload.letters || [];
                
                // Считаем СУММУ quantity всех букв
                // @ts-ignore
                state.count = state.letters.reduce((sum, item) => sum + (item.quantity || 0), 0);
            } else {
                state.app_id = undefined;
                state.count = 0;
                state.letters = [];
            }
        });

        builder.addCase(fetchMyOrders.fulfilled, (state, action) => {
            state.orders = action.payload;
        });

        builder.addCase(getManuscriptDetail.fulfilled, (state, action) => {
            const data = action.payload;
            // @ts-ignore
            state.letters = data.letters || [];
            state.manuscriptData = data;
            // @ts-ignore
            state.isDraft = (data.status === 'draft');
        });

        builder.addCase(deleteManuscript.fulfilled, (state) => {
            state.app_id = undefined;
            state.count = 0;
            state.letters = [];
            state.manuscriptData = {};
            state.isDraft = false;
        });
    }
});

export const { clearManuscriptState } = manuscriptSlice.actions;
export default manuscriptSlice.reducer;