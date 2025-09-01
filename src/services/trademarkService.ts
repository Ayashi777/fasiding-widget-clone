import { collection, addDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface TrademarkData {
  tmName: string;
  language: string;
  description: string;
  colorTm: string;
  colors: { 
    name: string; 
    image: string | null; 
    pdf: string | null 
  }[];
  nameUrl: string | null;
  logoUrl: string | null;
  mobileAdvantageUrl: string | null;
  desktopAdvantageUrl: string | null;
  advantages: { text: string; image: string | null }[];
  pdfUrl: string | null;
}

export const addTrademark = async (data: TrademarkData): Promise<string> => {
  try {
    const { language, ...trademarkData } = data;
    const languageRef = doc(db, "languages", language);
    const docRef = await addDoc(collection(languageRef, "trademarks"), {
      ...trademarkData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding trademark: ", error);
    throw error;
  }
};

export const getTrademarks = async (languageId: string): Promise<any[]> => {
  try {
    const languageRef = doc(db, "languages", languageId);
    const trademarksSnapshot = await getDocs(collection(languageRef, "trademarks"));
    return trademarksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting trademarks: ", error);
    return [];
  }
};