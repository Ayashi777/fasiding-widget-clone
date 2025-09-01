// services/imageService.ts
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase/firebase";
import { message } from "antd";
import { convertToWebp } from "../utils/imageUtils";

interface ImageData {
  houseName: string;
  trademarkName: string; 
  colorName: string[];
  imageUrls: string[];
}

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const optimizedFile = await convertToWebp(file);
    const storage = getStorage();
    const storageRef = ref(storage, `images/${optimizedFile.name}`);
    await uploadBytes(storageRef, optimizedFile);
    return await getDownloadURL(storageRef);
  } catch (error) {
    message.error("Помилка завантаження зображення:");
    return null;
  }
};

export const addImageToLanguage = async (
  languageId: string, 
  imageData: ImageData & { 
    houseId: string; 
    trademarkId: string; 
    colorId: string; 
    houseName: string;
  }
) => {
  try {
    await addDoc(collection(db, `languages/${languageId}/images`), {
      houseId: imageData.houseId, 
      houseName: imageData.houseName,
      trademarkId: imageData.trademarkId,
      trademarkName: imageData.trademarkName,
      colorId: imageData.colorId,
      colorName: imageData.colorName,
      imageUrls: imageData.imageUrls, 
    });
  } catch (error) {
    message.error("Помилка при додаванні зображення:");
    throw error;
  }
};

export const getImagesByLanguage = async (languageId: string) => {
  try {
    const imagesSnapshot = await getDocs(collection(db, `languages/${languageId}/images`));
    return imagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    message.error("Помилка під час завантаження зображень:");
    return [];
  }
};
