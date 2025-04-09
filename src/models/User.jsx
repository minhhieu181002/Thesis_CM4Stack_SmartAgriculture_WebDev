export class User {
  constructor(data = {}) {
    this.id = data.id || "";
    this.name = data.name || "Anonymous User";
    this.email = data.email || "";
    this.containers = Array.isArray(data.containers) ? data.containers : [];
    this.role = data.role || "user"; // Default role is 'user'
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }
  // get user's cabinet ID
  get cabinetIds() {
    return this.containers;
  }
  get hasCabinets() {
    return this.containers.length > 0;
  }
  // Convert to Firestore format
  toFirestore() {
    return {
      name: this.name,
      email: this.email,
      containers: this.containers,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  // Create from Firestore document
  static fromFirestore(doc) {
    if (!doc || !doc.exists) return null;
    return new User({
      id: doc.id,
      ...doc.data(),
    });
  }
}
