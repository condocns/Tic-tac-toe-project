import { API_ENDPOINTS } from "@/constants";

// Enhanced fetch with error handling and retries
class ApiClient {
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 2
  ): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(1000); // 1 second delay
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes("fetch") || 
             error.message.includes("network") ||
             error.message.includes("500");
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.fetchWithRetry(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.fetchWithRetry(url, {
      method: "GET",
    });
    return response.json();
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Game API methods
export const gameApi = {
  makeMove: (data: {
    cellIndex: number;
    board: (string | null)[];
    difficulty: string;
    humanPlayer: string;
    aiPlayer: string;
  }) => apiClient.post(API_ENDPOINTS.GAME_MOVE, data),

  saveResult: (data: {
    result: string;
    difficulty: string;
    moves: number[];
    duration: number;
  }) => apiClient.post(API_ENDPOINTS.GAME_RESULT, data),

  getHistory: (page = 1, limit = 10) =>
    apiClient.get(`${API_ENDPOINTS.GAME_HISTORY}?page=${page}&limit=${limit}`),
};

export const userApi = {
  getStats: () => apiClient.get(API_ENDPOINTS.USER_STATS),
};

export const leaderboardApi = {
  getLeaderboard: (page = 1, limit = 10, search = "") =>
    apiClient.get(`${API_ENDPOINTS.LEADERBOARD}?page=${page}&limit=${limit}&search=${search}`),
};
