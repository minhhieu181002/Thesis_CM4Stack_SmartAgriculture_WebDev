/**
 * Cabinet model representing a physical growing cabinet/container
 */
export class Cabinet {
  constructor(data = {}) {
    this.id = data.id || "";
    this.name = data.name || "Unnamed Cabinet";
    this.location = data.location || "";
    this.areas = Array.isArray(data.areas) ? [...data.areas] : [];
    this.outputDevices = Array.isArray(data.outputDevices)
      ? [...data.outputDevices]
      : [];
    this.sensors = Array.isArray(data.sensors) ? [...data.sensors] : [];
    this.plantIds = Array.isArray(data.plantIds) ? [...data.plantIds] : [];
    this.totalArea = typeof data.totalArea === "number" ? data.totalArea : 0;
    this.remainingArea =
      typeof data.remainingArea === "number"
        ? data.remainingArea
        : this.totalArea;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.userId = data.userId || "";
  }

  /**
   * Get number of areas in cabinet
   */
  get areaCount() {
    return this.areas.length;
  }

  /**
   * Get number of sensors in cabinet
   */
  get sensorCount() {
    return this.sensors.length;
  }

  /**
   * Get number of output devices in cabinet
   */
  get deviceCount() {
    return this.outputDevices.length;
  }

  /**
   * Get number of plants in cabinet
   */
  get plantCount() {
    return this.plantIds.length;
  }

  /**
   * Add a plant to the cabinet
   * @param {string} plantId - Plant ID to add
   */
  addPlant(plantId) {
    if (!plantId || this.plantIds.includes(plantId)) return false;
    this.plantIds.push(plantId);
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Remove a plant from the cabinet
   * @param {string} plantId - Plant ID to remove
   */
  removePlant(plantId) {
    const initialLength = this.plantIds.length;
    this.plantIds = this.plantIds.filter((id) => id !== plantId);

    if (this.plantIds.length !== initialLength) {
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Convert to Firestore format
   */
  toFirestore() {
    return {
      name: this.name,
      location: this.location,
      areas: this.areas,
      outputDevices: this.outputDevices,
      sensors: this.sensors,
      plantIds: this.plantIds,
      totalArea: this.totalArea,
      createdAt: this.createdAt,
      updatedAt: new Date(), // Always update the timestamp when saving
      userId: this.userId,
    };
  }

  /**
   * Create from Firestore document
   * @param {FirestoreDocumentSnapshot} doc - Firestore document snapshot
   */
  static fromFirestore(doc) {
    if (!doc) return null;

    const data = doc.data ? doc.data() : doc;

    return new Cabinet({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    });
  }

  /**
   * Create from Firestore snapshot
   * @param {FirestoreQuerySnapshot} snapshot - Firestore query snapshot
   */
  static fromFirestoreSnapshot(snapshot) {
    if (!snapshot) return [];

    return snapshot.docs.map((doc) =>
      Cabinet.fromFirestore({
        id: doc.id,
        ...doc.data(),
      })
    );
  }
}
