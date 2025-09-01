import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadTexture = async (file: File): Promise<string> => {
  const storage = getStorage();
  const storageRef = ref(storage, `textures/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const uploadLogo = async (file: File): Promise<string> => {
  const storage = getStorage();
  const storageRef = ref(storage, `logos/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const uploadPdf = async (file: File): Promise<string> => {
  const storage = getStorage();
  const storageRef = ref(storage, `pdfs/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
