import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


export interface LogSheetData {
    currentLocation: string;
    pickup: string;
    dropoff?: string;
    currentCycleUsed: string;
}

export interface TripData {
    tripTitle: string;
    pickup: string;
    dropoff?: string;
    cycleUsed: string;
    instructions?: string;
    email: string;
    logSheets: LogSheetData[];
}

export interface GetTrips {
    uniqueId: string;
    tripTitle: string;
    pickup: string;
    dropoff?: string;
    cycleUsed: string;
    instructions?: string;
    createdDate: string;
    tripNumber: number;
}

export interface GetTripData {
    uniqueId: string;
    tripTitle: string;
    pickup: string;
    dropoff?: string;
    cycleUsed: string;
    instructions?: string;
    createdDate: string;
    tripNumber: number;
    logSheets: {
        uniqueId: string;
        currentLocation: string;
        pickup: string;
        dropoff?: string;
        currentCycleUsed: string;
        createdDate: string;
        logNumber: number;
    }[];
}

export const geocodeLocation = async (location: string | null): Promise<{ lat: number; lon: number } | null> => {
    if (!location) return null;
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: location,
                format: 'json',
                limit: 1,
            },
        });
        const data = response.data[0];
        if (data) {
            return { lat: parseFloat(data.lat), lon: parseFloat(data.lon) };
        }
        return null;
    } catch (error) {
        console.error(`Error geocoding ${location}:`, error);
        return null;
    }
};

export const createTrip = async (tripData: TripData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-trip/`, tripData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { error: 'Trip creation failed' };
    }
};

export const getDriverTrips = async (email: string): Promise<GetTrips[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/get-driver-trips/`, {
            params: { email },
        });
        return response.data.trips;
    } catch (error: any) {
        throw error.response?.data || { error: 'Failed to fetch trips' };
    }
};


export const getTripById = async (tripId: string): Promise<GetTripData> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/get-trip-byid/`, {
            params: { tripId }
        });
        return response.data.trip;
    } catch (error: any) {
        throw error.response?.data || { error: 'Failed to fetch trip data' };
    }
};

export const addLogSheetsToTrip = async (tripId: string, logSheets: LogSheetData[]) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/add-log-sheets/`,
        { tripId, logSheets },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to add log sheets' };
    }
  };


export const updateLogSheets = async (tripId: string, logSheets: ({ uniqueId: string } & LogSheetData)[]) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/update-log-sheets/`,
        { tripId, logSheets },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update log sheets' };
    }
  };


export const deleteTrip = async (tripId: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete-trip/`, {
        params: { tripId },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to delete trip' };
    }
  };

