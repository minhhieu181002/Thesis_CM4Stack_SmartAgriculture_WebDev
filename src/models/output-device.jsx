// src/models/OutputDevice.js
export class OutputDevice {
  constructor(id, data) {
    this.id = id;
    this.areaId = data.areaId;
    this.containerId = data.containerId;
    this.controlMethod = data.controlMethod;
    this.name = data.name;
    this.status = data.status;
    this.type = data.type;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.lastActivatedAt = data.lastActivatedAt;
    this.lastDeactivatedAt = data.lastDeactivatedAt;
  }

  static fromFirestore(snapshot) {
    if (!snapshot.exists) return null;
    return new OutputDevice(snapshot.id, snapshot.data());
  }

  static fromFirestoreSnapshot(querySnapshot) {
    const devices = [];
    querySnapshot.forEach((doc) => {
      devices.push(
        new OutputDevice(doc.id, {
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          lastActivatedAt: doc.data().lastActivatedAt?.toDate(),
          lastDeactivatedAt: doc.data().lastDeactivatedAt?.toDate(),
        })
      );
    });
    return devices;
  }
}
