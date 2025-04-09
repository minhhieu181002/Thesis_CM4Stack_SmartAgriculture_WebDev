export class Area {
  constructor(data = {}) {
    this.id = data.id || "";
    this.name = data.name || "Unnamed Area";
    this.container = data.container || ""; // Cabinet ID
    this.isAvailable =
      data.isAvailable !== undefined ? Boolean(data.isAvailable) : true;
    this.maxPlantGroup = Number(data.maxPlantGroup) || 0;

    // Arrays of related entity IDs
    this.devices = Array.isArray(data.devices) ? data.devices : [];
    this.sensors = Array.isArray(data.sensors) ? data.sensors : [];
    this.plantIds = Array.isArray(data.plantIds) ? data.plantIds : [];

    // Counts
    this.deviceCount = Number(data.deviceCount) || 0;
    this.sensorCount = Number(data.sensorCount) || 0;
    this.plantCount = Number(data.plantCount) || 0;

    // Timestamps
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();

    // Cached related objects (for UI use)
    this._plantObjects = data._plantObjects || [];
    this._sensorObjects = data._sensorObjects || [];
    this._deviceObjects = data._deviceObjects || [];
  }

  // Check if area is at max capacity
  get isAtCapacity() {
    return this.plantCount >= this.maxPlantGroup;
  }

  // Check if area has plants
  get hasPlants() {
    return this.plantCount > 0;
  }

  // Check if area can accept more plants
  get canAcceptMorePlants() {
    return this.isAvailable && !this.isAtCapacity;
  }

  // Get percentage of capacity used
  get capacityPercentage() {
    if (this.maxPlantGroup === 0) return 0;
    return Math.round((this.plantCount / this.maxPlantGroup) * 100);
  }

  // Cached plant objects getter/setter
  set plantObjects(plantsList) {
    this._plantObjects = plantsList;
    this.plantCount = plantsList.length;
  }

  get plantObjects() {
    return this._plantObjects;
  }

  // Cached sensor objects getter/setter
  set sensorObjects(sensorsList) {
    this._sensorObjects = sensorsList;
    this.sensorCount = sensorsList.length;
  }

  get sensorObjects() {
    return this._sensorObjects;
  }

  // Cached device objects getter/setter
  set deviceObjects(devicesList) {
    this._deviceObjects = devicesList;
    this.deviceCount = devicesList.length;
  }

  get deviceObjects() {
    return this._deviceObjects;
  }

  // Convert to Firestore format
  toFirestore() {
    return {
      name: this.name,
      container: this.container,
      isAvailable: this.isAvailable,
      maxPlantGroup: this.maxPlantGroup,
      devices: this.devices,
      sensors: this.sensors,
      plantIds: this.plantIds,
      deviceCount: this.devices.length,
      sensorCount: this.sensors.length,
      plantCount: this.plantIds.length,
      createdAt: this.createdAt,
      updatedAt: new Date(), // Always update the timestamp
    };
  }

  // Create from Firestore document
  static fromFirestore(doc) {
    if (!doc || !doc.exists) return null;

    const data = doc.data();

    return new Area({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }

  // Create from Firestore snapshot
  static fromFirestoreSnapshot(snapshot) {
    if (!snapshot) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return new Area({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });
  }
}
