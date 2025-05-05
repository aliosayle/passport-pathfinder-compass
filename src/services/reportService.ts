import apiClient from '@/lib/api-client';

interface ReportOptions {
  format?: 'pdf' | 'csv';
  includeFlights?: boolean;
  includeTickets?: boolean;
  includePassports?: boolean;
  includeTransfers?: boolean;
  startDate?: string;
  endDate?: string;
}

class ReportService {
  async getUserReport(userId: string, options: ReportOptions = {}) {
    try {
      const response = await apiClient.get(`/reports/user/${userId}`, { params: options });
      return response.data;
    } catch (error) {
      console.error(`Error fetching report for user ${userId}:`, error);
      throw error;
    }
  }

  async downloadUserReport(userId: string, format: 'pdf' | 'csv' = 'pdf', options: Omit<ReportOptions, 'format'> = {}) {
    try {
      const response = await apiClient.get(`/reports/user/${userId}/download`, {
        params: { format, ...options },
        responseType: 'blob'
      });
      
      // Create a download link and click it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_report_${userId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error(`Error downloading report for user ${userId}:`, error);
      throw error;
    }
  }
}

export const reportService = new ReportService();