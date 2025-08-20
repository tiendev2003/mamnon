import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/api'

// Async thunks
export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/teachers')
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch teachers' })
    }
  }
)

export const fetchTeacherById = createAsyncThunk(
  'teachers/fetchTeacherById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/teachers/${id}`)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch teacher' })
    }
  }
)

export const createTeacher = createAsyncThunk(
  'teachers/createTeacher',
  async (teacherData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/teachers', teacherData)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create teacher' })
    }
  }
)

export const updateTeacher = createAsyncThunk(
  'teachers/updateTeacher',
  async ({ id, ...teacherData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/teachers/${id}`, teacherData)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update teacher' })
    }
  }
)

export const deleteTeacher = createAsyncThunk(
  'teachers/deleteTeacher',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/teachers/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete teacher' })
    }
  }
)

const initialState = {
  teachers: [],
  currentTeacher: null,
  isLoading: false,
  error: null,
}

const teacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentTeacher: (state) => {
      state.currentTeacher = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.isLoading = false
        state.teachers = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Teacher By Id
      .addCase(fetchTeacherById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTeacherById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTeacher = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchTeacherById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Teacher
      .addCase(createTeacher.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.isLoading = false
        state.teachers.push(action.payload.data || action.payload)
        state.error = null
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Teacher
      .addCase(updateTeacher.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedTeacher = action.payload.data || action.payload
        const index = state.teachers.findIndex(t => t._id === updatedTeacher._id)
        if (index !== -1) {
          state.teachers[index] = updatedTeacher
        }
        state.error = null
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Teacher
      .addCase(deleteTeacher.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.isLoading = false
        state.teachers = state.teachers.filter(t => t._id !== action.payload)
        state.error = null
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentTeacher } = teacherSlice.actions

export default teacherSlice.reducer

// Selectors
export const selectTeachers = (state) => state.teachers.teachers
export const selectCurrentTeacher = (state) => state.teachers.currentTeacher
export const selectTeachersLoading = (state) => state.teachers.isLoading
export const selectTeachersError = (state) => state.teachers.error
