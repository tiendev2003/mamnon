import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

// Async thunks
export const fetchSchedules = createAsyncThunk(
  'schedules/fetchSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/schedules')
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchSchedulesByDate = createAsyncThunk(
  'schedules/fetchSchedulesByDate',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules?startDate=${startDate}&endDate=${endDate}`)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchSchedulesByTeacher = createAsyncThunk(
  'schedules/fetchSchedulesByTeacher',
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/teacher/${teacherId}`)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createSchedule = createAsyncThunk(
  'schedules/createSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/schedules', scheduleData)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateSchedule = createAsyncThunk(
  'schedules/updateSchedule',
  async ({ id, ...scheduleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/schedules/${id}`, scheduleData)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteSchedule = createAsyncThunk(
  'schedules/deleteSchedule',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/schedules/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState: {
    schedules: [],
    currentWeekSchedules: [],
    selectedSchedule: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedSchedule: (state, action) => {
      state.selectedSchedule = action.payload
    },
    clearSelectedSchedule: (state) => {
      state.selectedSchedule = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false
        state.schedules = action.payload
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch schedules by date
      .addCase(fetchSchedulesByDate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchedulesByDate.fulfilled, (state, action) => {
        state.loading = false
        state.currentWeekSchedules = action.payload
      })
      .addCase(fetchSchedulesByDate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch schedules by teacher
      .addCase(fetchSchedulesByTeacher.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchedulesByTeacher.fulfilled, (state, action) => {
        state.loading = false
        state.schedules = action.payload
      })
      .addCase(fetchSchedulesByTeacher.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false
        state.schedules.push(action.payload)
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update schedule
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false
        const index = state.schedules.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.schedules[index] = action.payload
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false
        state.schedules = state.schedules.filter(s => s._id !== action.payload)
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setSelectedSchedule, clearSelectedSchedule } = scheduleSlice.actions

// Selectors
export const selectSchedules = (state) => state.schedules.schedules
export const selectCurrentWeekSchedules = (state) => state.schedules.currentWeekSchedules
export const selectSelectedSchedule = (state) => state.schedules.selectedSchedule
export const selectSchedulesLoading = (state) => state.schedules.loading
export const selectSchedulesError = (state) => state.schedules.error

export default scheduleSlice.reducer
