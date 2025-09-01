import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { message } from "antd";

export const getColors = async (selectedLanguage: string): Promise<string[]> => {
  try {
    const languagesSnapshot = await getDocs(collection(db, "languages"));

    const colorPromises = languagesSnapshot.docs.map((languageDoc) =>
      getDocs(collection(languageDoc.ref, "colors"))
    );

    const colorsSnapshots = await Promise.all(colorPromises);

    return colorsSnapshots.flatMap((snapshot) =>
      snapshot.docs.map((colorDoc) => colorDoc.data().colorName).filter(Boolean)
    );
  } catch (error) {
    return [];
  }
};

export const getColorsWithTrademarks = async (selectedLanguage: string) => {
  try {
    const languagesSnapshot = await getDocs(collection(db, "languages"));

    const colorPromises = languagesSnapshot.docs.map((languageDoc) =>
      getDocs(collection(languageDoc.ref, "colors"))
    );

    const colorsSnapshots = await Promise.all(colorPromises);

    return colorsSnapshots.flatMap((snapshot) =>
      snapshot.docs.map((colorDoc) => {
        const colorData = colorDoc.data();

        if (!colorData.trademarks) {
          return {
            id: colorDoc.id,
            colorName: colorData.colorName,
            trademarkName: colorData.trademarkName || "Не указано",
            trademarkTextureUrl: null,
          };
        }

        return colorData.trademarks.map((tm: any) => ({
          id: colorDoc.id,
          colorName: colorData.colorName,
          trademarkName: tm.trademarkName,
          trademarkTextureUrl: tm.trademarkTextureUrl || null,
        }));
      })
    );
  } catch (error) {
    return [];
  }
};



export const addColorToLanguage = async (
  languageId: string,
  colorData: {
    colorName: string;
    trademarks: { trademarkId: string; trademarkName: string; trademarkTextureUrl?: string | null }[];
  }
) => {
  try {
    await addDoc(collection(db, `languages/${languageId}/colors`), colorData);
  } catch (error) {
    throw error;
  }
};

export const getUniqueColorsWithTrademarks = async (selectedLanguage: string) => {
  try {
    const languagesSnapshot = await getDocs(collection(db, "languages"));

    const colorPromises = languagesSnapshot.docs.map((languageDoc) =>
      getDocs(collection(languageDoc.ref, "colors"))
    );

    const colorsSnapshots = await Promise.all(colorPromises);

    const allColors = colorsSnapshots.flatMap((snapshot) =>
      snapshot.docs.map((colorDoc) => {
        const colorData = colorDoc.data();

        if (!colorData.trademarks) {
          return {
            id: colorDoc.id,
            colorName: colorData.colorName,
            trademarkName: colorData.trademarkName || "Не указано",
            trademarkTextureUrl: null,
          };
        }

        return colorData.trademarks.map((tm: any) => ({
          id: colorDoc.id,
          colorName: colorData.colorName,
          trademarkName: tm.trademarkName,
          trademarkTextureUrl: tm.trademarkTextureUrl || null,
        }));
      })
    );

    const uniqueColors = allColors.flat().filter((value, index, self) =>
      index === self.findIndex((t) =>
        t.colorName === value.colorName && t.trademarkName === value.trademarkName
      )
    );

    return uniqueColors;
  } catch (error) {
    message.error("Error fetching unique colors:",);
    return [];
  }
};
