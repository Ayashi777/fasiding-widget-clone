import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { convertToWebp } from "../utils/imageUtils";

export const uploadTexture = async (file: File): Promise<string> => {
  const optimizedFile = await convertToWebp(file);
  const storage = getStorage();
  const storageRef = ref(storage, `textures/${optimizedFile.name}`);
  await uploadBytes(storageRef, optimizedFile);
  return await getDownloadURL(storageRef);
};

export const uploadLogo = async (file: File): Promise<string> => {
  const optimizedFile = await convertToWebp(file);
  const storage = getStorage();
  const storageRef = ref(storage, `logos/${optimizedFile.name}`);
  await uploadBytes(storageRef, optimizedFile);
  return await getDownloadURL(storageRef);
};

export const uploadPdf = async (file: File): Promise<string> => {
  const storage = getStorage();
  const storageRef = ref(storage, `pdfs/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
