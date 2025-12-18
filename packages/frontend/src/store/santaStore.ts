import { create } from 'zustand';
import type {
  SleighMetrics,
  ReindeerStatus,
  WorkshopMetrics,
  DeliveryMetrics,
  WeatherConditions,
  Incident,
  DeliveryStop,
  TimelineState,
} from 'shared-types';

interface SantaState {
  // State
  sleighMetrics: SleighMetrics | null;
  reindeerStatus: ReindeerStatus[];
  workshopMetrics: WorkshopMetrics | null;
  deliveryMetrics: DeliveryMetrics | null;
  weatherConditions: WeatherConditions | null;
  activeIncidents: Incident[];
  deliveryRoute: DeliveryStop[];
  timelineState: TimelineState;

  // Actions
  setSleighMetrics: (metrics: SleighMetrics) => void;
  setReindeerStatus: (status: ReindeerStatus[]) => void;
  setWorkshopMetrics: (metrics: WorkshopMetrics) => void;
  setDeliveryMetrics: (metrics: DeliveryMetrics) => void;
  setWeatherConditions: (conditions: WeatherConditions) => void;
  setActiveIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  resolveIncident: (incidentId: string) => void;
  setDeliveryRoute: (route: DeliveryStop[]) => void;
  updateDeliveryStop: (stop: DeliveryStop) => void;
  setTimelineState: (state: TimelineState) => void;
  resetStore: () => void;
}

const initialState = {
  sleighMetrics: null,
  reindeerStatus: [],
  workshopMetrics: null,
  deliveryMetrics: null,
  weatherConditions: null,
  activeIncidents: [],
  deliveryRoute: [],
  timelineState: {
    mode: 'route-planning' as const,
    currentTime: new Date().toISOString(),
    christmasEveStart: new Date(new Date().getFullYear(), 11, 24, 18, 0, 0).toISOString(),
    percentComplete: 0,
    phase: 'Preparation',
  },
};

export const useSantaStore = create<SantaState>((set) => ({
  ...initialState,

  setSleighMetrics: (metrics: SleighMetrics) =>
    set({ sleighMetrics: metrics }),

  setReindeerStatus: (status: ReindeerStatus[]) =>
    set({ reindeerStatus: status }),

  setWorkshopMetrics: (metrics: WorkshopMetrics) =>
    set({ workshopMetrics: metrics }),

  setDeliveryMetrics: (metrics: DeliveryMetrics) =>
    set({ deliveryMetrics: metrics }),

  setWeatherConditions: (conditions: WeatherConditions) =>
    set({ weatherConditions: conditions }),

  setActiveIncidents: (incidents: Incident[]) =>
    set({ activeIncidents: incidents }),

  addIncident: (incident: Incident) =>
    set((state) => ({
      activeIncidents: [...state.activeIncidents, incident],
    })),

  resolveIncident: (incidentId: string) =>
    set((state) => ({
      activeIncidents: state.activeIncidents.map((incident) =>
        incident.id === incidentId
          ? { ...incident, status: 'resolved' as const, resolutionTime: new Date().toISOString() }
          : incident
      ),
    })),

  setDeliveryRoute: (route: DeliveryStop[]) =>
    set({ deliveryRoute: route }),

  updateDeliveryStop: (stop: DeliveryStop) =>
    set((state) => ({
      deliveryRoute: state.deliveryRoute.map((s) =>
        s.id === stop.id ? stop : s
      ),
    })),

  setTimelineState: (timelineState: TimelineState) =>
    set({ timelineState }),

  resetStore: () => set(initialState),
}));
