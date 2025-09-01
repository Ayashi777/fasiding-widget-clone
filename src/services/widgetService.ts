import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const addWidget = async (widgetData: {
  widgetName: string;
  adminEmail: string;
  languageId: string;
  color: any[];
  trademark: any[];
  house: any[];
}) => {
  try {
    const fullWidgetData = {
      ...widgetData,
      color: widgetData.color.filter(Boolean),
      trademark: widgetData.trademark.filter(Boolean),
      house: widgetData.house.filter(Boolean),
    };

    const docRef = await addDoc(collection(db, "widgets"), fullWidgetData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding widget:", error);
    throw error;
  }
};

export const updateWidget = async (
  widgetId: string,
  widgetData: {
    widgetName: string;
    adminEmail: string;
    languageId: string;
    color: any[];
    trademark: any[];
    house: any[];
  }
) => {
  try {
    const fullWidgetData = {
      ...widgetData,
      color: widgetData.color.filter(Boolean),
      trademark: widgetData.trademark.filter(Boolean),
      house: widgetData.house.filter(Boolean),
    };

    await updateDoc(doc(db, "widgets", widgetId), fullWidgetData);
    return widgetId;
  } catch (error) {
    console.error("Error updating widget:", error);
    throw error;
  }
};