import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

// Async thunks
export const fetchTherapySessions = createAsyncThunk(
  'therapySessions/fetchTherapySessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/therapy')
      return response.data.data || [] // Extract data from success response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchTherapySessionById = createAsyncThunk(
  'therapySessions/fetchTherapySessionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/therapy/${id}`)
      return response.data.data || null
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchTherapySessionsByStudent = createAsyncThunk(
  'therapySessions/fetchTherapySessionsByStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/therapy?student=${studentId}`)
      return response.data.data || []
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchTherapySessionsByTherapist = createAsyncThunk(
  'therapySessions/fetchTherapySessionsByTherapist',
  async (therapistId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/therapy?therapist=${therapistId}`)
      return response.data.data || []
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createTherapySession = createAsyncThunk(
  'therapySessions/createTherapySession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/therapy', sessionData)
      return response.data.data || {}
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateTherapySession = createAsyncThunk(
  'therapySessions/updateTherapySession',
  async ({ id, ...sessionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/therapy/${id}`, sessionData)
      return response.data.data || {}
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteTherapySession = createAsyncThunk(
  'therapySessions/deleteTherapySession',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/therapy/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const therapySlice = createSlice({
  name: 'therapySessions',
  initialState: {
    sessions: [],
    selectedSession: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedSession: (state, action) => {
      state.selectedSession = action.payload
    },
    clearSelectedSession: (state) => {
      state.selectedSession = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch therapy sessions
      .addCase(fetchTherapySessions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTherapySessions.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = action.payload
      })
      .addCase(fetchTherapySessions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch therapy session by ID
      .addCase(fetchTherapySessionById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTherapySessionById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedSession = action.payload
      })
      .addCase(fetchTherapySessionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch sessions by student
      .addCase(fetchTherapySessionsByStudent.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = action.payload
      })
      
      // Fetch sessions by therapist
      .addCase(fetchTherapySessionsByTherapist.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = action.payload
      })
      
      // Create therapy session
      .addCase(createTherapySession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTherapySession.fulfilled, (state, action) => {
        state.loading = false
        state.sessions.push(action.payload)
      })
      .addCase(createTherapySession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update therapy session
      .addCase(updateTherapySession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTherapySession.fulfilled, (state, action) => {
        state.loading = false
        const index = state.sessions.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.sessions[index] = action.payload
        }
        if (state.selectedSession?._id === action.payload._id) {
          state.selectedSession = action.payload
        }
      })
      .addCase(updateTherapySession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete therapy session
      .addCase(deleteTherapySession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTherapySession.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = state.sessions.filter(s => s._id !== action.payload)
        if (state.selectedSession?._id === action.payload) {
          state.selectedSession = null
        }
      })
      .addCase(deleteTherapySession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setSelectedSession, clearSelectedSession } = therapySlice.actions

// Selectors
export const selectTherapySessions = (state) => state.therapySessions.sessions
export const selectSelectedTherapySession = (state) => state.therapySessions.selectedSession
export const selectTherapySessionsLoading = (state) => state.therapySessions.loading
export const selectTherapySessionsError = (state) => state.therapySessions.error

export default therapySlice.reducer
