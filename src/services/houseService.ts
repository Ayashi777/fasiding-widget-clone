import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/firebase";
import { message } from "antd";

export const getLanguages = async () => {
  try {
    const snapshot = await getDocs(collection(db, "languages"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Без назви",
    }));
  } catch (error) {
    console.error("Помилка завантаження мов:", error);
    throw error;
  }
};

export const getHouses = async (languageId: string) => {
  try {
    const housesSnapshot = await getDocs(collection(db, `languages/${languageId}/houses`));
    const houses = housesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      iconUrl: doc.data().iconUrl || "",
    }));


    return houses;
  } catch (error) {
    console.error("Помилка завантаження будинків:", error);
    throw error;
  }
};

export const addHouse = async (languageId: string, name: string, file?: File) => {
  try {
    if (!name) {
      throw new Error("Назва будинку не може бути порожньою!");
    }

    let iconUrl = "";
    
    if (file) {
      const storageRef = ref(storage, `house_icons/${file.name}`);
      await uploadBytes(storageRef, file);
      iconUrl = await getDownloadURL(storageRef);
    }

    const houseData = { 
      name, 
      iconUrl 
    };

    await addDoc(collection(db, `languages/${languageId}/houses`), houseData);
    return true;
  } catch (error) {
    message.error("Помилка додавання будинку:");
    throw error;
  }
};
