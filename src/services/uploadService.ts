import api from '../lib/api-client';
import { authService } from './authService';

interface UploadFile {
  id: string;
  user_id: string;
  employee_id?: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  last_accessed?: string;
  description?: string;
}

interface UploadResponse {
  message: string;
  file: UploadFile;
}

const uploadService = {
  // Upload a file
  upload: async (file: File, description?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await api.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  // Upload a file for specific employee
  uploadForEmployee: async (employeeId: string, file: File, description?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', employeeId);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await api.post<UploadResponse>('/uploads/employee', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  // Get all uploads (admin only)
  getAll: async (): Promise<UploadFile[]> => {
    const response = await api.get<UploadFile[]>('/uploads/all');
    return response.data;
  },
  
  // Get current user's uploads
  getMyUploads: async (): Promise<UploadFile[]> => {
    const response = await api.get<UploadFile[]>('/uploads/my-uploads');
    return response.data;
  },
  
  // Get uploads by user ID (admin only)
  getByUserId: async (userId: string): Promise<UploadFile[]> => {
    const response = await api.get<UploadFile[]>(`/uploads/user/${userId}`);
    return response.data;
  },
  
  // Get uploads by employee ID
  getByEmployeeId: async (employeeId: string): Promise<UploadFile[]> => {
    const response = await api.get<UploadFile[]>(`/uploads/employee/${employeeId}`);
    return response.data;
  },
  
  // Get file details by ID
  getById: async (id: string): Promise<UploadFile> => {
    const response = await api.get<UploadFile>(`/uploads/${id}`);
    return response.data;
  },
  
  // Get download URL for a file with authentication token
  getDownloadUrl: (id: string): string => {
    const token = authService.getToken();
    return `${api.defaults.baseURL}/uploads/${id}/download?token=${token}`;
  },
  
  // Get view URL for a file with authentication token
  getViewUrl: (id: string): string => {
    const token = authService.getToken();
    return `${api.defaults.baseURL}/uploads/${id}/view?token=${token}`;
  },
  
  // Update file description
  updateDescription: async (id: string, description: string): Promise<UploadFile> => {
    const response = await api.patch<UploadFile>(`/uploads/${id}/description`, { description });
    return response.data;
  },
  
  // Delete a file
  delete: async (id: string): Promise<void> => {
    await api.delete(`/uploads/${id}`);
  },
};

export type { UploadFile, UploadResponse };
export default uploadService;