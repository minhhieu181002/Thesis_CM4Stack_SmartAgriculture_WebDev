export class Plant {
  constructor(data = {}) {
    this.id = data.id || "";
    this.plantVariety = data.plantVariety || "Unknown";
    this.category = data.category || ["Uncategorized"];
    this.nameOfArea = data.nameOfArea || "";
    this.imageUrl = data.imageUrl || "";
    this.sensors = data.sensors || [];
    this.outputDevices = data.outputDevices || [];
    this.thresholds = data.thresholds || {};
    this.datePlanted = data.datePlanted ? new Date(data.datePlanted) : null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Get time since last update in human-readable format
  get lastUpdatedText() {
    const now = new Date();
    const diff = now - this.updatedAt;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 14) return `${Math.floor(days / 7)} weeks ago`;
    if (days > 0) return `${days} days ago`;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hours ago`;

    return "Recently updated";
  }

  // Derive plant status based on age or thresholds
  get status() {
    // Simplified status logic - can be enhanced with threshold data
    if (!this.datePlanted) return "Not Planted";

    const now = new Date();
    const plantAge = now - this.datePlanted;
    const daysOld = Math.floor(plantAge / (1000 * 60 * 60 * 24));

    if (daysOld < 7) return "Germinating";
    if (daysOld < 30) return "Growing";
    if (daysOld < 60) return "Maturing";
    return "Ready for Harvest";
  }

  // Convert Firestore document to Plant instance
  static fromFirestore(doc) {
    if (!doc || !doc.exists) return null;

    const data = doc.data();
    return new Plant({
      id: doc.id,
      ...data,
      datePlanted: data.datePlanted?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }

  // Create from Firestore snapshot
  static fromFirestoreSnapshot(snapshot) {
    if (!snapshot) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return new Plant({
        id: doc.id,
        ...data,
        datePlanted: data.datePlanted?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });
  }
}
