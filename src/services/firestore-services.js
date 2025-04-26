import {
  getDocs,
  collection,
  query,
  where,
  documentId,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  serverTimestamp,
  runTransaction,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Cabinet } from "@models/Cabinet";
import { Area } from "@models/Area";
import { User } from "@models/User";
import { OutputDevice } from "@models/OutputDevice";
import { Plant } from "@models/Plant";
import { updateSchedulerTimesRealTime } from "./realtime-service";

/**
 * Connect a container to a user
 * @param {string} userId - The user ID
 * @param {string} containerId - The container ID to connect
 * @returns {Promise<void>}
 */
export const connectContainerToUser = async (userId, containerId) => {
  try {
    // check the container exist or not
    const containerRef = doc(db, "containers", containerId);
    const containerSnap = await getDoc(containerRef);
    if (!containerSnap.exists()) {
      throw new Error(`Container with ID ${containerId} does not exist`);
    }
    // Then check if the container is already connected to the user
    const containerData = containerSnap.data();
    // if (containerData.userId && containerData.userId !== userId) {
    //   throw new Error("This container is already assigned to another user");
    // }
    // Update the container with the user ID if it's not already set
    if (!containerData.userId) {
      await updateDoc(containerRef, {
        userId: userId,
        updatedAt: serverTimestamp(),
      });
    }
    // Update the user document to include this container
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      containers: arrayUnion(containerId),
      updatedAt: serverTimestamp(),
    });
    return { success: true, message: "Container connected successfully" };
  } catch (error) {
    console.error("Error connecting container:", error);
    throw error;
  }
};
/**
 * Creates default user data for new users or when user document is not found
 * @param {string} userId - Firebase Auth UID
 * @param {string|null} email - User email if available
 * @returns {User} Default User object
 */
export const createDefaultUserData = (userId, email = null) => {
  return new User({
    id: userId,
    name: "Demo User",
    email: email || "demo@gmail.com",
    containers: ["container_04"], // Default container with demo data
    role: "User",
    phoneNumber: "",
    profilePicture:
      "https://ui-avatars.com/api/?name=Demo+User&background=random",
    createdAt: new Date(),
  });
};
/**
 * Creates or fetches a user document in Firestore
 * When a new user signs up, this ensures they have a document in the users collection
 *
 * @param {Object} authUser - The Firebase auth user object
 * @param {Object} additionalData - Optional additional user data
 * @returns {Promise<User>} - The User object
 */
export const createUserDocument = async (authUser, additionalData) => {
  if (!authUser) {
    throw new Error("No authentication user provided");
  }
  try {
    const userDocRef = doc(db, "users", authUser.uid);
    const userSnapshot = await getDoc(userDocRef);
    // check if user document exists or not
    if (!userSnapshot.exists()) {
      const { displayName, email, photoURL } = authUser;
      const createAt = new Date();
      // Safe log - only log containers if additionalData has them
      console.log("container: ", additionalData?.containers || "none provided");

      // create user data with safe fallbacks
      const userData = {
        id: authUser.uid,
        name: displayName || additionalData?.name || "Demo User",
        email: email || additionalData?.email || "",
        containers: [],
        role: additionalData?.role || "User",
        phoneNumber: additionalData?.phoneNumber || "",
        profilePicture:
          photoURL ||
          additionalData?.profilePicture ||
          "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(displayName || "Demo User"),
        createdAt: createAt,
      };
      // add user data to firestore
      await setDoc(userDocRef, userData);
      console.log("User document created:", userData);

      return new User(userData);
    }
    return User.fromFirestore({
      id: userSnapshot.id,
      exists: true,
      data: () => userSnapshot.data(),
    });
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};
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
      return createDefaultUserData(userId);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return createDefaultUserData(userId);
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
export const getOutputDevicesByContainerId = async (containerId) => {
  if (!containerId) return [];
  try {
    const q = query(
      collection(db, "outputDevices"),
      where("containerId", "==", containerId)
    );
    const querySnapshot = await getDocs(q);
    return OutputDevice.fromFirestoreSnapshot(querySnapshot);
  } catch (error) {
    console.error("Error fetching output devices:", error);
    throw error;
  }
};
export const updateOutputDeviceStatus = async (deviceId, status) => {
  if (!deviceId) {
    console.error("Device ID is required");
    return false;
  }

  if (status !== "active" && status !== "inactive") {
    console.error("Status must be 'active' or 'inactive'");
    return false;
  }

  try {
    // Reference to the output device document
    const deviceRef = doc(db, "outputDevices", deviceId);

    // Update the status and timestamp
    await updateDoc(deviceRef, {
      status: status,
      updatedAt: serverTimestamp(),
      [status === "active" ? "lastActivatedAt" : "lastDeactivatedAt"]:
        serverTimestamp(),
    });

    console.log(
      `Output device ${deviceId} status updated to ${status} in Firestore`
    );
    return true;
  } catch (error) {
    console.error(
      `Error updating output device ${deviceId} in Firestore:`,
      error
    );
    return false;
  }
};
export const updateOutputDeviceControlMethod = async (
  deviceId,
  controlMethod
) => {
  if (!deviceId) {
    console.error("Device ID is required");
    return false;
  }

  if (controlMethod !== "Manual" && controlMethod !== "Auto") {
    console.error("Control method must be 'Manual' or 'Auto'");
    return false;
  }

  try {
    // Reference to the output device document
    const deviceRef = doc(db, "outputDevices", deviceId);

    // Update the control method and timestamp
    await updateDoc(deviceRef, {
      controlMethod: controlMethod,
      updatedAt: serverTimestamp(),
    });

    console.log(
      `Output device ${deviceId} control method updated to ${controlMethod} in Firestore`
    );
    return true;
  } catch (error) {
    console.error(
      `Error updating output device ${deviceId} control method in Firestore:`,
      error
    );
    return false;
  }
};

export const updateSchedulerTimes = async (schedulerId, schedulerData) => {
  try {
    if (!schedulerId) {
      console.error("Invalid scheduler ID provided");
      return false;
    }
    const { startTime, endTime, date } = schedulerData;
    if ((!startTime || !endTime, !date)) {
      console.error("invalid scheduler data provided");
      return false;
    }
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    // create date object
    const scheduledDate = new Date(date);
    const startDateTime = new Date(scheduledDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(scheduledDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // convert to firestore timestamp
    const startTimestamp = Timestamp.fromDate(startDateTime);
    const endTimestamp = Timestamp.fromDate(endDateTime);

    // scheduler document ref
    const schedulerRef = doc(db, "schedules", schedulerId);
    await updateDoc(schedulerRef, {
      startTime: startTimestamp,
      endTime: endTimestamp,
    });
    console.log(`Schedule updated for scheduler ${schedulerId}`);
    return true;
  } catch (err) {
    console.error("Error updating scheduler: ", err);
    return false;
  }
};

export const updateSchedulerComplete = async (
  containerId,
  schedulerId,
  deviceId,
  scheduleData
) => {
  try {
    // Update in Firestore
    const firestoreSuccess = await updateSchedulerTimes(
      schedulerId,
      scheduleData
    );

    // Update in Real-time Database
    const rtdbSuccess = await updateSchedulerTimesRealTime(
      containerId,
      schedulerId,
      scheduleData
    );

    // If deviceId is provided, update device mode to Auto
    if (deviceId && firestoreSuccess && rtdbSuccess) {
      await updateOutputDeviceControlMethod(deviceId, "Auto");
    }

    // Return true only if both updates were successful
    return firestoreSuccess && rtdbSuccess;
  } catch (error) {
    console.error("Error in complete scheduler update:", error);
    return false;
  }
};

/**
 * Fetches plant documents by their IDs
 * @param {string[]} plantIds - Array of plant document IDs
 * @returns {Promise<Plant[]>} Array of Plant objects
 */
export const getPlantsByIds = async (plantIds) => {
  if (!plantIds || !Array.isArray(plantIds) || plantIds.length === 0) {
    console.log("No plant IDs provided");
    return [];
  }

  try {
    // Firestore limits "in" queries to 10 items, so we need to batch
    const batchSize = 10;
    const batches = [];

    // Split plantIds into batches of 10
    for (let i = 0; i < plantIds.length; i += batchSize) {
      const batch = plantIds.slice(i, i + batchSize);

      const q = query(
        collection(db, "plantGroup"),
        where(documentId(), "in", batch)
      );

      batches.push(getDocs(q));
    }

    // Wait for all batches to complete
    const snapshots = await Promise.all(batches);

    // Combine all documents into a single array
    const plants = [];
    snapshots.forEach((snapshot) => {
      const batchPlants = Plant.fromFirestoreSnapshot(snapshot);
      plants.push(...batchPlants);
    });

    return plants;
  } catch (error) {
    console.error("Error fetching plants by IDs:", error);
    throw error;
  }
};

/**
 * Fetches all plants in a specific area
 * @param {string} areaId - Area name/ID
 * @returns {Promise<Plant[]>} Array of Plant objects
 */
export const getPlantsByAreaId = async (areaId) => {
  if (!areaId) return [];

  try {
    const q = query(
      collection(db, "plants"),
      where("nameOfArea", "==", areaId)
    );
    const querySnapshot = await getDocs(q);
    return Plant.fromFirestoreSnapshot(querySnapshot);
  } catch (error) {
    console.error("Error fetching plants by area ID:", error);
    throw error;
  }
};

/**
 * Get a single plant by ID
 * @param {string} plantId - ID of the plant to fetch
 * @returns {Promise<Plant|null>} Plant object or null if not found
 */
export const getPlantById = async (plantId) => {
  if (!plantId) return null;

  try {
    const plantDoc = await getDoc(doc(db, "plants", plantId));
    return Plant.fromFirestore(plantDoc);
  } catch (error) {
    console.error(`Error fetching plant with ID ${plantId}:`, error);
    throw error;
  }
};
/**
 * Maps plant categories to their respective image URLs
 */
const PLANT_CATEGORY_IMAGES = {
  Vegetable: "assets/images/plants/vegetable/3.0x/vegetable.png",
  Fruit: "assets/images/plants/fruit/3.0x/fruit.png",
  Herb: "assets/images/plants/herb/3.0x/herb.png",
  Food_Crop: "assets/images/plants/foodCrop/3.0x/foodCrop.png",
  Industrial_Tree:
    "assets/images/plants/industrialCrop/3.0x/industrialCrop.png",
};

/**
 * Adds a new plant to Firestore and updates related collections
 *
 * @param {Object} plantData - Plant data from the form
 * @param {string} plantData.areaId - The ID of the area this plant belongs to
 * @param {string} plantData.plantName - The name/variety of the plant
 * @param {string} plantData.category - The plant category
 * @param {Date} plantData.plantDate - The date when the plant was planted
 * @returns {Promise<string>} - The ID of the newly created plant
 */
export const addPlant = async (plantData) => {
  console.log(plantData.areaId);
  try {
    // Get area document to retrieve containerId
    const areaRef = doc(db, "areas", plantData.areaId);
    const areaDoc = await getDoc(areaRef);

    if (!areaDoc.exists()) {
      throw new Error(`Area with ID ${plantData.areaId} not found`);
    }

    const areaData = areaDoc.data();
    const containerId = areaData.container;
    console.log("area data is: ", areaData);
    // console.log(containerId);
    // const nameOfArea = areaData.name;

    if (!containerId) {
      throw new Error("Area does not have an associated container");
    }

    // Prepare plant data
    const newPlantData = {
      nameOfArea: plantData.areaId, // Store area ID rather than name for consistency
      category: [plantData.category], // Store as array for potential multi-category
      plantVariety: plantData.plantName,
      datePlanted: plantData.plantDate || new Date(),
      imageUrl:
        PLANT_CATEGORY_IMAGES[plantData.category] ||
        "assets/images/plants/default.png",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      sensors: [], // Initialize as empty arrays
      outputDevices: [],
      thresholds: {}, // Initialize empty thresholds object
    };
    console.log("new plant data is: ", newPlantData);
    // Use a transaction to ensure all operations succeed or fail together
    const plantId = await runTransaction(db, async (transaction) => {
      // 1. Create the new plant document
      const plantRef = doc(collection(db, "plantGroup"));
      transaction.set(plantRef, newPlantData);

      // 2. Update the area with the new plant ID
      transaction.update(areaRef, {
        plantIds: arrayUnion(plantRef.id),
        plantCount: (areaData.plantCount || 0) + 1,
        updatedAt: serverTimestamp(),
      });

      // 3. Update the cabinet/container document if it exists
      const containerRef = doc(db, "containers", containerId);
      transaction.update(containerRef, {
        plantIds: arrayUnion(plantRef.id),
        updatedAt: serverTimestamp(),
      });

      return plantRef.id;
    });

    console.log(`Plant added successfully with ID: ${plantId}`);
    return plantId;
  } catch (error) {
    console.error("Error adding plant:", error);
    throw error;
  }
};
/**
 * Deletes a plant and removes its references from related collections
 *
 * @param {string} plantId - The ID of the plant to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deletePlant = async (plantId) => {
  if (!plantId) {
    throw new Error("Plant ID is required");
  }

  try {
    // Get plant document to retrieve its area ID
    const plantRef = doc(db, "plantGroup", plantId);
    const plantDoc = await getDoc(plantRef);

    if (!plantDoc.exists()) {
      throw new Error(`Plant with ID ${plantId} not found`);
    }

    const plantData = plantDoc.data();
    console.log(plantData);
    const areaId = plantData.nameOfArea;

    if (!areaId) {
      throw new Error("Plant does not have an associated area");
    }

    // Get area document to retrieve container ID
    const areaRef = doc(db, "areas", areaId);
    const areaDoc = await getDoc(areaRef);

    if (!areaDoc.exists()) {
      throw new Error(`Area with ID ${areaId} not found`);
    }

    const areaData = areaDoc.data();
    const containerId = areaData.container;
    console.log(areaData);
    console.log(containerId);
    // Use a transaction to ensure all operations succeed or fail together
    await runTransaction(db, async (transaction) => {
      let containerData = null;
      let containerRef = null;
      if (containerId) {
        containerRef = doc(db, "containers", containerId);
        const containerDoc = await transaction.get(containerRef);

        if (containerDoc.exists()) {
          containerData = containerDoc.data();
        }
      }
      // 1. Delete the plant document
      transaction.delete(plantRef);

      // 2. Update the area to remove the plant ID and decrement plant count
      const currentPlantIds = areaData.plantIds || [];
      const updatedPlantIds = currentPlantIds.filter((id) => id !== plantId);
      const newPlantCount = Math.max((areaData.plantCount || 0) - 1, 0);

      transaction.update(areaRef, {
        plantIds: updatedPlantIds,
        plantCount: newPlantCount,
        updatedAt: serverTimestamp(),
      });

      // 3. Update the container document if we found it earlier
      if (containerRef && containerData) {
        const containerPlantIds = containerData.plantIds || [];
        const updatedContainerPlantIds = containerPlantIds.filter(
          (id) => id !== plantId
        );

        transaction.update(containerRef, {
          plantIds: updatedContainerPlantIds,
          updatedAt: serverTimestamp(),
        });
      }
    });

    console.log(`Plant with ID ${plantId} successfully deleted`);
    return true;
  } catch (error) {
    console.error("Error deleting plant:", error);
    throw error;
  }
};

/**
 * Fetches threshold settings for a sensor
 * @param {string} sensorId - ID of the sensor
 * @returns {Promise<Object|null>} Threshold settings or null if not found
 */
export const getThresholdBySensorId = async (sensorId) => {
  if (!sensorId) return null;
  try {
    const sensorDoc = await getDoc(doc(db, "sensors", sensorId));
    if (!sensorDoc.exists()) {
      console.log(`No sensor found with ID: ${sensorId}`);
      return null;
    }
    const sensorData = sensorDoc.data();
    const thresholdId = sensorData.thresholdId;
    if (!thresholdId) {
      console.log(`No threshold ID found for sensor: ${sensorId}`);
      return null;
    }

    // fetch the threshold document
    const thresholdDoc = await getDoc(doc(db, "thresholds", thresholdId));
    if (!thresholdDoc.exists()) {
      console.log(`No threshold found with ID: ${thresholdId}`);
      return null;
    }
    return {
      id: thresholdDoc.id,
      ...thresholdDoc.data(),
    };
  } catch (error) {
    console.error(`Error fetching threshold for sensor ${sensorId}:`, error);
    return null;
  }
};

/**
 * Saves threshold settings for a sensor to Firestore
 * @param {string} sensorId - ID of the sensor
 * @param {Object} thresholdData - Threshold data to save
 * @returns {Promise<boolean>} - True if the save was successful
 */
export const saveThresholdForSensor = async (sensorId, thresholdData) => {
  if (!sensorId || !thresholdData) {
    console.error("Sensor ID and threshold data are required");
    return false;
  }

  try {
    // Fetch the sensor document to get the threshold ID
    const sensorDoc = await getDoc(doc(db, "sensors", sensorId));
    if (!sensorDoc.exists()) {
      console.error(`Sensor with ID ${sensorId} not found`);
      return false;
    }

    const sensorData = sensorDoc.data();
    let thresholdId = sensorData.thresholdId;

    // If no threshold ID exists, create a new threshold document
    if (!thresholdId) {
      const newThresholdRef = doc(collection(db, "thresholds"));
      thresholdData.createdAt = serverTimestamp();
      thresholdData.updatedAt = serverTimestamp();
      thresholdData.sensorId = sensorId;
      thresholdData.sensorType = sensorData.type || "unknown";

      await setDoc(newThresholdRef, thresholdData);

      // Update the sensor document with the new threshold ID
      await updateDoc(doc(db, "sensors", sensorId), {
        thresholdId: newThresholdRef.id,
        updatedAt: serverTimestamp(),
      });

      console.log(`New threshold created for sensor ${sensorId}`);
      return true;
    }

    // Update the existing threshold document
    thresholdData.updatedAt = serverTimestamp();
    await updateDoc(doc(db, "thresholds", thresholdId), thresholdData);

    console.log(`Threshold updated for sensor ${sensorId}`);
    return true;
  } catch (error) {
    console.error(`Error saving threshold for sensor ${sensorId}:`, error);
    return false;
  }
};
