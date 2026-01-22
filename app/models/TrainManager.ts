import { INVALID_COORD, INVALID_DATE, MAX_ACTIVE_TRAINS } from "../utils/constants";
import { TrainRegistry } from "../utils/types";
import { RoutingManager } from "./RoutingManager";
import { Train } from "./Train";

export type StationTrain = {id: string; name: string; from: string; to: string; eta?: number; dt?: number;};

export class TrainManager {
  private trains: { [id: string] : Train } = {}
  private activeTrains: Train[] = []
  private maxActiveTrains: number;
  private lastSelectedDate: Date = INVALID_DATE;
  private routingManager: RoutingManager;

  private favoriteTrains: Set<string> = new Set();
  private showFavoritesOnly: boolean = false;

  constructor(routingManager: RoutingManager, date: Date, trainData: TrainRegistry, maxActiveTrains: number = MAX_ACTIVE_TRAINS) {
      this.routingManager = routingManager;
      this.maxActiveTrains = maxActiveTrains;

      this.updateTrainData(date, trainData);
  }

  updateTrainData(date: Date, trainData: TrainRegistry) {
    this.lastSelectedDate = date;
    this.trains = {}

    const trainIds = Object.keys(trainData).slice(0, this.maxActiveTrains);
    trainIds.forEach((id) => {
      const train = new Train(id, trainData[id], this.routingManager);
      this.trains[id] = train;
    });

    this.updateActiveTrains(date);
  }

  async updateTrainPositions(time: number) {
    for (const train of this.activeTrains)
      train.updatePosition(time);
  }

  updateActiveTrains(date: Date) {
    const day = date.getDay();
    let active = Object.values(this.trains).filter((train) => train.isActiveOnDay(day));

    if (this.showFavoritesOnly)
      active = active.filter((train) => this.favoriteTrains.has(train.getID()));

    this.activeTrains = active;
  }

  getActiveTrains() {
    return this.activeTrains;
  }

  getTrainsOnRouteCount() {
    return this.activeTrains.filter(train => train.getPosition() !== INVALID_COORD).length;
  }

  getTrain(id: string) {
    return this.trains[id];
  }

  getLastSelectedDate() {
    return this.lastSelectedDate;
  }

  addFavorite(trainId: string) {
    this.favoriteTrains.add(trainId);
    if (this.showFavoritesOnly)
      this.updateActiveTrains(this.lastSelectedDate);
  }

  removeFavorite(trainId: string) {
    this.favoriteTrains.delete(trainId);
    if (this.showFavoritesOnly)
      this.updateActiveTrains(this.lastSelectedDate);
  }

  toggleFavorite(trainId: string) {
    if (this.favoriteTrains.has(trainId))
      this.removeFavorite(trainId);
    else
      this.addFavorite(trainId);
  }

  setShowFavoritesOnly(value: boolean) {
    if (this.showFavoritesOnly === value)
      return;

    this.showFavoritesOnly = value;
    this.updateActiveTrains(this.lastSelectedDate);
  }

  getShowFavoritesOnly() {
    return this.showFavoritesOnly;
  }

  getFavoriteTrains() {
    return Array.from(this.favoriteTrains);
  }

  setFavoriteTrain(favoriteTrainIds: string[]) {
    this.favoriteTrains = new Set(favoriteTrainIds);
    if (this.showFavoritesOnly)
      this.updateActiveTrains(this.lastSelectedDate);
  }

  getUpcomingArrivalsForStation(
    stationName: string,
    limit = 10
  ): StationTrain[] {
    const res: StationTrain[] = [];

    for (const train of this.getActiveTrains()) {
      const stopIdx = train.getStopIndexByName(stationName);
      if (stopIdx === -1) continue;

      const eta = train.getEtaSecondsToStop(stopIdx);
      if (eta === null) continue;

      res.push({
        id: train.getID(),
        name: train.toString(),
        eta,
        from: train.getStop(0),
        to: train.getStop(train.getStopsCount() - 1),
      });
    }

    res.sort((a, b) => (a.eta ?? 0) - (b.eta ?? 0));
    return res.slice(0, limit);
  }

  getUpcomingDeparturesForStation(
    stationName: string,
    maxHours = 24,
    limit = 20
  ): StationTrain[] {
    const maxSeconds = maxHours * 3600;
    const res: StationTrain[] = [];

    for (const train of this.getActiveTrains()) {
      const idx = train.getStopIndexByName(stationName);
      if (idx === -1) continue;

      const dt = train.getSecondsToDepartureFromStop(idx);
      if (dt === null || dt > maxSeconds) continue;

      res.push({
        id: train.getID(),
        name: train.toString(),
        dt,
        from: train.getStop(0),
        to: train.getStop(train.getStopsCount() - 1),
      });
    }

    res.sort((a, b) => (a.dt ?? 0) - (b.dt ?? 0));
    return res.slice(0, limit);
  }
}
