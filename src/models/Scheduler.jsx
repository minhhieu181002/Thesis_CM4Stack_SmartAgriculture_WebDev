export class Scheduler {
  constructor(id, data) {
    this.id = id;
    this.containerId = data.containerId;
    this.outputDeviceId = data.outputDeviceId;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.status = data.status;
  }
  static fromFirestore(snapshot) {
    if (!snapshot.exists) return null;
    return new Scheduler(snapshot.id, {
      ...snapshot.data(),
      startTime: snapshot.data().startTime.toDate(),
      endTime: snapshot.data().endTime.toDate(),
    });
  }
  static fromFirestoreSnapshot(querySnapshot) {
    const schedulers = [];
    querySnapshot.forEach((doc) => {
      schedulers.push(
        new Scheduler(doc.id, {
          ...doc.data(),
          startTime: doc.data().startTime?.toDate(),
          endTime: doc.data().endTime?.toDate(),
        })
      );
    });
    return schedulers;
  }
}
