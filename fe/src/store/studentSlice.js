import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/api'

// Async thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students')
      return response.data.data || []
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch students' })
    }
  }
)

export const fetchStudentById = createAsyncThunk(
  'students/fetchStudentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/students/${id}`)
      return response.data.data || {}
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch student' })
    }
  }
)

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/students', studentData)
      return response.data.data || {}
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create student' })
    }
  }
)

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ id, ...studentData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/students/${id}`, studentData)
      return response.data.data || {}
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update student' })
    }
  }
)

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/students/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete student' })
    }
  }
)

const initialState = {
  students: [],
  currentStudent: null,
  isLoading: false,
  error: null,
}

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentStudent: (state) => {
      state.currentStudent = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false
        state.students = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Student By Id
      .addCase(fetchStudentById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentStudent = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Student
      .addCase(createStudent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.isLoading = false
        state.students.push(action.payload.data || action.payload)
        state.error = null
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Student
      .addCase(updateStudent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedStudent = action.payload.data || action.payload
        const index = state.students.findIndex(s => s._id === updatedStudent._id)
        if (index !== -1) {
          state.students[index] = updatedStudent
        }
        state.error = null
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Student
      .addCase(deleteStudent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.isLoading = false
        state.students = state.students.filter(s => s._id !== action.payload)
        state.error = null
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentStudent } = studentSlice.actions

export default studentSlice.reducer

// Selectors
export const selectStudents = (state) => state.students.students
export const selectCurrentStudent = (state) => state.students.currentStudent
export const selectStudentsLoading = (state) => state.students.isLoading
export const selectStudentsError = (state) => state.students.error
