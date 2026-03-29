import httpClient from './httpClient';

export interface DashboardStats {
  totalContacts: number;
  totalCampaigns: number;
  totalCalls: number;
  activeCampaigns: number;
  recentActivity: any[];
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  type: string;
  data: any;
  createdAt: Date;
}

export const analyticsApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await httpClient.get<DashboardStats>('/analytics/dashboard');
    return data;
  },

  async getReports(filters?: ReportFilters): Promise<AnalyticsReport[]> {
    const { data } = await httpClient.get<AnalyticsReport[]>('/analytics/reports', {
      params: filters,
    });
    return data.map((report) => ({
      ...report,
      createdAt: new Date(report.createdAt),
    }));
  },

  async generateReport(type: string, filters: ReportFilters): Promise<AnalyticsReport> {
    const { data } = await httpClient.post<AnalyticsReport>('/analytics/reports/generate', {
      type,
      filters,
    });
    return {
      ...data,
      createdAt: new Date(data.createdAt),
    };
  },

  async exportReport(reportId: string, format: 'csv' | 'pdf' | 'xlsx'): Promise<Blob> {
    const response = await httpClient.get(`/analytics/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
