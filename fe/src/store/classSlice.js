import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/api'

// Async thunks
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/classes')
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch classes' })
    }
  }
)

export const fetchClassById = createAsyncThunk(
  'classes/fetchClassById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/classes/${id}`)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch class' })
    }
  }
)

export const createClass = createAsyncThunk(
  'classes/createClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/classes', classData)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create class' })
    }
  }
)

export const updateClass = createAsyncThunk(
  'classes/updateClass',
  async ({ id, ...classData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/classes/${id}`, classData)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update class' })
    }
  }
)

export const deleteClass = createAsyncThunk(
  'classes/deleteClass',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/classes/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete class' })
    }
  }
)

const initialState = {
  classes: [],
  currentClass: null,
  isLoading: false,
  error: null,
}

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentClass: (state) => {
      state.currentClass = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Classes
      .addCase(fetchClasses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.isLoading = false
        state.classes = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Class By Id
      .addCase(fetchClassById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentClass = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchClassById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Class
      .addCase(createClass.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.isLoading = false
        state.classes.push(action.payload.data || action.payload)
        state.error = null
      })
      .addCase(createClass.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Class
      .addCase(updateClass.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedClass = action.payload.data || action.payload
        const index = state.classes.findIndex(c => c._id === updatedClass._id)
        if (index !== -1) {
          state.classes[index] = updatedClass
        }
        state.error = null
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Class
      .addCase(deleteClass.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.isLoading = false
        state.classes = state.classes.filter(c => c._id !== action.payload)
        state.error = null
      })
      .addCase(deleteClass.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentClass } = classSlice.actions

export default classSlice.reducer

// Selectors
export const selectClasses = (state) => state.classes.classes
export const selectCurrentClass = (state) => state.classes.currentClass
export const selectClassesLoading = (state) => state.classes.isLoading
export const selectClassesError = (state) => state.classes.error
