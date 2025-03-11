import { GetTripData } from './tripServices';
import { LogSheetWithCoords, LogSheetDistance } from './mapServices';

export interface ValidLogSheet {
    uniqueId: string;
    driverName?: string;
    currentLocation: string;
    pickup: string;
    dropoff?: string;
    createdDate: string;
    currentCycleUsed: string;
    totalDistance: number;
    cycleHours: number;
    stopInstructions: string[];
    segmentDurations: number[];
    offDutyHours: number;
    sleeperBerthHours: number;
    drivingHours: number;
    onDutyHours: number;
    dutyChanges: { time: number; status: number }[];
}

export function computeValidLogSheets(
    trip: GetTripData,
    logSheetCoords: LogSheetWithCoords[],
    logSheetDistances: LogSheetDistance[],
    driverName: string
): ValidLogSheet[] {
    return trip.logSheets
        .map((log, index) => {
            const logSheetCoord = logSheetCoords[index];
            return {
                log,
                index,
                hasWarning: logSheetCoord?.warnings?.length > 0,
            };
        })
        .filter(({ hasWarning }) => !hasWarning)
        .map(({ log, index }) => ({
            uniqueId: log.uniqueId,
            driverName,
            currentLocation: log.currentLocation,
            pickup: log.pickup,
            dropoff: log.dropoff,
            createdDate: log.createdDate,
            currentCycleUsed: log.currentCycleUsed,
            totalDistance: logSheetDistances[index]?.totalDistance || 0,
            cycleHours: logSheetDistances[index]?.cycleHours || 0,
            stopInstructions: logSheetCoords[index]?.stopInstructions || [],
            segmentDurations: logSheetCoords[index]?.segmentDurations || [],
            offDutyHours: logSheetCoords[index]?.offDutyHours || 0,
            sleeperBerthHours: logSheetCoords[index]?.sleeperBerthHours || 0,
            drivingHours: logSheetCoords[index]?.drivingHours || 0,
            onDutyHours: logSheetCoords[index]?.onDutyHours || 0,
            dutyChanges: [
                { time: 0, status: 1 },
                { time: 1, status: 4 },
                { time: 2, status: 3 },
                { time: Math.max(2, logSheetDistances[index]?.cycleHours || 0) + 2, status: 4 },
                { time: Math.max(2, logSheetDistances[index]?.cycleHours || 0) + 3, status: 1 },
            ],
        }));
}