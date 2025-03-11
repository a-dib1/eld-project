import polyline from '@mapbox/polyline';
import { LatLngTuple } from 'leaflet';
import { GetTripData, getTripById, geocodeLocation } from './tripServices';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LogSheetWithCoords {
  uniqueId: string;
  currentLocation: string;
  pickup: string;
  dropoff?: string;
  currentLocationCoords: Coordinates | null;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  routePaths: LatLngTuple[][];
  stopInstructions: string[];
  fuelingStops: { coords: Coordinates; distanceAtStop: number }[];
  restBreakStops: { coords: Coordinates; drivingHoursAtBreak: number }[];
  segmentDurations: number[];
  segmentDistances: number[];
  totalDistance: number;
  cycleHours: number;
  warnings: string[];
  offDutyHours: number;
  sleeperBerthHours: number;
  drivingHours: number;
  onDutyHours: number;
}

export interface LogSheetDistance {
  uniqueId: string;
  totalDistance: number;
  cycleHours: number;
}

export async function fetchRoadRoute(
  coord1: Coordinates,
  coord2: Coordinates
): Promise<{ distance: number; path: LatLngTuple[]; duration: number }> {
  const url = `https://router.project-osrm.org/route/v1/driving/${coord1.lon},${coord1.lat};${coord2.lon},${coord2.lat}?overview=full`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes.length > 0) {
      const distance = data.routes[0].distance / 1000;
      const duration = data.routes[0].duration / 3600;
      const encodedPolyline = data.routes[0].geometry;
      const decodedCoords = polyline.decode(encodedPolyline);
      const path: LatLngTuple[] = decodedCoords.map(([lat, lon]) => [lat, lon] as LatLngTuple);
      return { distance, path, duration };
    }
    return { distance: 0, path: [], duration: 0 };
  } catch (error) {
    console.error('Error fetching road route:', error);
    return { distance: 0, path: [], duration: 0 };
  }
}

export async function fetchTripData(tripId: string): Promise<{
  trip: GetTripData | null;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  logSheetCoords: LogSheetWithCoords[];
  logSheetDistances: LogSheetDistance[];
  totalCycleHours: number;
  daysSpan: number;
}> {
  try {
    const data = await getTripById(tripId);
    if (!data) {
      return {
        trip: null,
        pickupCoords: null,
        dropoffCoords: null,
        logSheetCoords: [],
        logSheetDistances: [],
        totalCycleHours: 0,
        daysSpan: 0,
      };
    }

    const tripPickupCoords = await geocodeLocation(data.pickup);
    const tripDropoffCoords = await geocodeLocation(data.dropoff ?? null);

    let cumulativeDistance = 0;
    const logCoordsPromises = data.logSheets.map(async (log) => {
      const pickupCoords = await geocodeLocation(log.pickup);
      const currentLocationCoords = await geocodeLocation(log.currentLocation);
      const dropoffCoords = await geocodeLocation(log.dropoff ?? null);

      const routePaths: LatLngTuple[][] = [];
      const stopInstructions: string[] = [];
      const fuelingStops: { coords: Coordinates; distanceAtStop: number }[] = [];
      const restBreakStops: { coords: Coordinates; drivingHoursAtBreak: number }[] = [];
      const segmentDurations: number[] = [];
      const segmentDistances: number[] = [];
      let totalDistance = 0;
      const warnings: string[] = [];

      const coords = [currentLocationCoords, pickupCoords];
      if (dropoffCoords) coords.push(dropoffCoords);
      const filteredCoords = coords.filter((coord) => coord !== null) as Coordinates[];

      stopInstructions.push(`Start at ${log.currentLocation}`);

      for (let i = 0; i < filteredCoords.length - 1; i++) {
        const route = await fetchRoadRoute(filteredCoords[i], filteredCoords[i + 1]);
        const fromLocation = i === 0 ? log.currentLocation : log.pickup;
        const toLocation = i === 0 ? log.pickup : log.dropoff;

        if (route.duration > 10) {
          const fractionTo10Hours = 10 / route.duration;
          const distanceAt10Hours = route.distance * fractionTo10Hours;
          const remainingDistance = route.distance - distanceAt10Hours;
          const remainingDuration = route.duration - 10;

          const pathLength = route.path.length;
          const splitIndex = Math.floor(pathLength * fractionTo10Hours);
          const pathBeforeBreak = route.path.slice(0, splitIndex);
          const pathAfterBreak = route.path.slice(splitIndex);

          totalDistance += distanceAt10Hours;
          cumulativeDistance += distanceAt10Hours;
          routePaths.push(pathBeforeBreak);
          segmentDurations.push(10);
          segmentDistances.push(distanceAt10Hours);
          stopInstructions.push(
            `Drive from ${fromLocation} to intermediate point (${10.00} hrs, ${distanceAt10Hours.toFixed(2)} km)`
          );

          const breakCoord = { lat: pathBeforeBreak[pathBeforeBreak.length - 1][0], lon: pathBeforeBreak[pathBeforeBreak.length - 1][1] };
          restBreakStops.push({ coords: breakCoord, drivingHoursAtBreak: 10 });
          stopInstructions.push(`Mandatory 30-min break after 10 hrs of driving`);

          totalDistance += remainingDistance;
          cumulativeDistance += remainingDistance;
          routePaths.push(pathAfterBreak);
          segmentDurations.push(remainingDuration);
          segmentDistances.push(remainingDistance);
          stopInstructions.push(
            `Drive from intermediate point to ${toLocation} (${remainingDuration.toFixed(2)} hrs, ${remainingDistance.toFixed(2)} km)`
          );
        } else {
          totalDistance += route.distance;
          cumulativeDistance += route.distance;
          routePaths.push(route.path);
          segmentDurations.push(route.duration);
          segmentDistances.push(route.distance);
          stopInstructions.push(
            `Drive from ${fromLocation} to ${toLocation} (${route.duration.toFixed(2)} hrs, ${route.distance.toFixed(2)} km)`
          );
        }

        if (i === 0) {
          stopInstructions.push(`Stop at ${log.pickup} for pickup (30 min)`);
        } else if (i === 1 && log.dropoff) {
          stopInstructions.push(`Stop at ${log.dropoff} for dropoff (30 min)`);
        }

        const distanceSinceLastFuel = cumulativeDistance % 1000;
        if (cumulativeDistance >= 1000 && distanceSinceLastFuel <= route.distance) {
          const fuelIndex = Math.floor(
            (route.distance - (distanceSinceLastFuel || route.distance)) / route.distance * route.path.length
          );
          const fuelCoord = { lat: route.path[fuelIndex][0], lon: route.path[fuelIndex][1] };
          fuelingStops.push({ coords: fuelCoord, distanceAtStop: cumulativeDistance });
          stopInstructions.push(`Fueling stop after ${Math.floor(cumulativeDistance)} km (30 min)`);
        }
      }

      const drivingHours = segmentDurations.reduce((sum, dur) => sum + dur, 0);
      const pickupStopHours = 0.5;
      const dropoffStopHours = log.dropoff ? 0.5 : 0;
      const fuelingStopHours = fuelingStops.length * 0.5;
      const restBreakHours = segmentDurations.some(d => d > 10) ? 0.5 : 0;
      const onDutyHours = pickupStopHours + dropoffStopHours + fuelingStopHours + restBreakHours;
      const cycleHours = drivingHours + onDutyHours;
      const totalDailyHours = 24;
      const offDutyHours = cycleHours <= totalDailyHours ? totalDailyHours - cycleHours : 0;
      const sleeperBerthHours = 0;

      if (cycleHours > 14) {
        warnings.push(`Warning: 14-Hour Driving Window exceeded (${cycleHours.toFixed(2)} hrs) - Related ELD logs are omitted`);
      }

      return {
        uniqueId: log.uniqueId,
        currentLocation: log.currentLocation,
        pickup: log.pickup,
        dropoff: log.dropoff,
        currentLocationCoords,
        pickupCoords,
        dropoffCoords,
        routePaths,
        stopInstructions,
        fuelingStops,
        restBreakStops,
        segmentDurations,
        segmentDistances,
        totalDistance: Number(totalDistance.toFixed(2)),
        cycleHours: Number(cycleHours.toFixed(2)),
        warnings,
        offDutyHours: Number(offDutyHours.toFixed(2)),
        sleeperBerthHours: Number(sleeperBerthHours.toFixed(2)),
        drivingHours: Number(drivingHours.toFixed(2)),
        onDutyHours: Number(onDutyHours.toFixed(2)),
      };
    });

    const logCoords = await Promise.all(logCoordsPromises);

    const distances = logCoords.map((log) => ({
      uniqueId: log.uniqueId,
      totalDistance: log.totalDistance,
      cycleHours: log.cycleHours,
    }));

    const totalCycleHours = distances.reduce((sum, log) => sum + log.cycleHours, 0);
    const dates = data.logSheets.map((log) => new Date(log.createdDate).getTime()).sort((a, b) => a - b);
    const daysSpan = dates.length > 1 ? (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24) : 0;

    return {
      trip: data,
      pickupCoords: tripPickupCoords,
      dropoffCoords: tripDropoffCoords,
      logSheetCoords: logCoords,
      logSheetDistances: distances,
      totalCycleHours,
      daysSpan,
    };
  } catch (error) {
    console.error('Error fetching trip data:', error);
    return {
      trip: null,
      pickupCoords: null,
      dropoffCoords: null,
      logSheetCoords: [],
      logSheetDistances: [],
      totalCycleHours: 0,
      daysSpan: 0,
    };
  }
}