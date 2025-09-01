import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface Language {
  id: string;
  name: string;
}

export const getLanguages = async (): Promise<Language[]> => {
  try {
    const snapshot = await getDocs(collection(db, "languages"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Без назви",
    }));
  } catch (error) {
    return [];
  }
};

export const addLanguage = async (values: { name: string; code: string; widget?: object; form?: object }) => {
  try {
    await addDoc(collection(db, "languages"), {
      name: values.name,
      code: values.code,
      translations: {
        widget: values.widget || {},
        form: values.form || {},
      },
    });
  } catch (error) {
    throw error;
  }
};