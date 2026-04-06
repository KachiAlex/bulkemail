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
    try {
      const { data } = await httpClient.get<DashboardStats>('/analytics/dashboard');
      return data;
    } catch (error) {
      console.warn('Analytics dashboard endpoint not available, returning defaults');
      return {
        totalContacts: 0,
        totalCampaigns: 0,
        totalCalls: 0,
        activeCampaigns: 0,
        recentActivity: [],
      };
    }
  },

  async getReports(filters?: ReportFilters): Promise<AnalyticsReport[]> {
    try {
      const { data } = await httpClient.get<AnalyticsReport[]>('/analytics/reports', {
        params: filters,
      });
      return data.map((report) => ({
        ...report,
        createdAt: new Date(report.createdAt),
      }));
    } catch (error) {
      console.warn('Analytics reports endpoint not available, returning empty array');
      return [];
    }
  },

  async generateReport(type: string, filters: ReportFilters): Promise<AnalyticsReport> {
    try {
      const { data } = await httpClient.post<AnalyticsReport>('/analytics/reports/generate', {
        type,
        filters,
      });
      return {
        ...data,
        createdAt: new Date(data.createdAt),
      };
    } catch (error) {
      console.warn('Analytics report generation not available, returning mock data');
      return {
        id: Date.now().toString(),
        name: `Mock Report ${type}`,
        type,
        data: {},
        createdAt: new Date(),
      };
    }
  },

  async exportReport(reportId: string, format: 'csv' | 'pdf' | 'xlsx'): Promise<Blob> {
    try {
      const response = await httpClient.get(`/analytics/reports/${reportId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.warn('Analytics export not available, returning empty blob');
      return new Blob();
    }
  },
};
