import {
  getDocs,
  collection,
  query,
  where,
  documentId,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Cabinet } from "../models/Cabinet";
import { Area } from "../models/Area";
import { User } from "../models/User";

/**
 * Fetches the user document from Firestore by user ID
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<User|null>} User object or null if not found
 */
export const getUserById = async (userId) => {
  if (!userId) {
    console.warn("getUserById called without userId");
    return null;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      // Convert to User model instance
      return User.fromFirestore({
        id: userSnapshot.id,
        exists: true,
        data: () => userSnapshot.data(),
      });
    } else {
      console.log(`No user document found for ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
/**
 * Fetches cabinets using container IDs from a user
 * @param {string[]} containerIds - Array of cabinet/container IDs
 * @returns {Promise<Cabinet[]>} Array of Cabinet objects
 */
export const getCabinetsByContainerIds = async (containerIds) => {
  if (
    !containerIds ||
    !Array.isArray(containerIds) ||
    containerIds.length === 0
  ) {
    console.log("No container IDs provided");
    return [];
  }

  try {
    console.log("Fetching cabinets with IDs:", containerIds);

    // Query for documents whose ID is in the containerIds array
    const q = query(
      collection(db, "containers"),
      where(documentId(), "in", containerIds)
    );
    const querySnapshot = await getDocs(q);

    return Cabinet.fromFirestoreSnapshot(querySnapshot);
  } catch (error) {
    console.error("Error fetching cabinets by container IDs:", error);
    throw error;
  }
};
// ----- AREA SERVICE METHODS -----

// Fetch areas by cabinet ID
export const getAreasByCabinetId = async (cabinetId) => {
  if (!cabinetId) return null;
  const q = query(collection(db, "areas"), where("container", "==", cabinetId));
  const querySnapshot = await getDocs(q);
  return Area.fromFirestoreSnapshot(querySnapshot);
};

/**
 * Fetches sensors associated with a specific area
 * @param {string} areaId - ID of the area
 * @returns {Promise<Array>} Array of sensor objects
 */
export const getSensorsByAreaId = async (areaId) => {
  if (!areaId) return [];

  try {
    // First, get the area to access its sensors array
    const areaDocRef = doc(db, "areas", areaId);
    const areaDoc = await getDoc(areaDocRef);

    if (!areaDoc.exists()) {
      console.log(`No area found with ID: ${areaId}`);
      return [];
    }

    const areaData = areaDoc.data();
    const sensorIds = areaData.sensors || [];

    if (sensorIds.length === 0) {
      return [];
    }

    // Get all sensor documents in a single query
    const sensorsQuery = query(
      collection(db, "sensors"),
      where(documentId(), "in", sensorIds)
    );

    const sensorSnapshot = await getDocs(sensorsQuery);
    const sensors = [];

    sensorSnapshot.forEach((doc) => {
      sensors.push({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps if needed
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    return sensors;
  } catch (error) {
    console.error("Error fetching sensors for area:", error);
    throw error;
  }
};
