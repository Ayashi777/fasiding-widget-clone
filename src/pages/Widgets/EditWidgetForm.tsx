// EditWidgetForm.tsx
import React, { useState, useEffect } from "react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import { updateWidget } from "../../services/widgetService";
import { getColorsWithTrademarks } from "../../services/colorService";
import { getHouses } from "../../services/houseService";
import { getLanguages } from "../../services/languageService";
import { getTrademarks } from "../../services/trademarkService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const { Option } = Select;

interface Language {
  id: string;
  name: string;
}

interface ColorData {
  id: string;
  name: string;
  trademarks: any[];
}

interface Trademark {
  id: string;
  [key: string]: any;
}

interface WidgetData {
  id: string;
  widgetName: string;
  adminEmail: string;
  languageId: string;
  color: ColorData[];
  trademark: Trademark[];
  house: any[];
}

const EditWidgetForm: React.FC<{
  widgetId: string;
  refreshTable: () => void;
  onClose: () => void;
}> = ({ widgetId, refreshTable, onClose }) => {
  const [form] = Form.useForm();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [colors, setColors] = useState<ColorData[]>([]);
  const [trademarks, setTrademarks] = useState<Trademark[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<WidgetData | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const languagesList = await getLanguages();
        setLanguages(languagesList);

        const docRef = doc(db, "widgets", widgetId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const widgetData = { id: docSnap.id, ...docSnap.data() } as WidgetData;
          setInitialData(widgetData);
          setSelectedLanguage(widgetData.languageId);

          form.setFieldsValue({
            languageId: widgetData.languageId,
            widgetName: widgetData.widgetName,
            adminEmail: widgetData.adminEmail,
            color: widgetData.color.map(c => c.id),
            trademark: widgetData.trademark.map(t => t.id),
            house: widgetData.house.map(h => h.id),
          });
        }
      } catch (error) {
        message.error("Не вдалося завантажити дані виджету.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [widgetId, form]);

  useEffect(() => {
    if (selectedLanguage) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [colorsWithTrademarks, tmList, housesList] = await Promise.all([
            getColorsWithTrademarks(selectedLanguage),
            getTrademarks(selectedLanguage),
            getHouses(selectedLanguage),
          ]);

          const colorsData: ColorData[] = colorsWithTrademarks
            .map((trademarkArray: any[]) => {
              if (trademarkArray.length > 0) {
                const { id, colorName } = trademarkArray[0];
                return {
                  id,
                  name: colorName,
                  trademarks: trademarkArray,
                };
              }
              return null;
            })
            .filter((item: ColorData | null) => item !== null) as ColorData[];

          setColors(colorsData);
          setTrademarks(tmList);
          setHouses(housesList);
        } catch (error) {
          message.error("Не вдалося завантажити дані.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedLanguage]);

  const handleSubmit = async (values: any) => {
    const colorWidgetData = values.color.map((colorId: string) =>
      colors.find(c => c.id === colorId)
    );
    const trademarkWidgetData = values.trademark.map((tmId: string) =>
      trademarks.find(tm => tm.id === tmId)
    );
    const houseWidgetData = values.house.map((houseId: string) =>
      houses.find(house => house.id === houseId)
    );

    const widgetData = {
      languageId: values.languageId,
      widgetName: values.widgetName,
      adminEmail: values.adminEmail,
      color: colorWidgetData,
      trademark: trademarkWidgetData,
      house: houseWidgetData,
    };

    setLoading(true);
    try {
      await updateWidget(widgetId, widgetData);
      message.success("Віджет успішно оновлено!");
      refreshTable();
      onClose();
    } catch (error) {
      message.error("Не вдалося оновити Віджет.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Редагувати Віджет"
      open={true}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Вибір мови"
          name="languageId"
          rules={[{ required: true, message: "Будь ласка, виберіть мову!" }]}
        >
          <Select placeholder="Оберіть мову" onChange={setSelectedLanguage} disabled={loading}>
            {languages.map(lang => (
              <Option key={lang.id} value={lang.id}>
                {lang.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Назва Віджету"
          name="widgetName"
          rules={[{ required: true, message: "Будь ласка, введіть назву Віджету!" }]}
        >
          <Input placeholder="Введіть назву Віджету" disabled={loading} />
        </Form.Item>
        <Form.Item
          label="Email адміністратора"
          name="adminEmail"
          rules={[{ required: true, message: "Будь ласка, введіть email!" }]}
        >
          <Input type="email" placeholder="Введіть email адміністратора" disabled={loading} />
        </Form.Item>
        <Form.Item label="Кольори" name="color">
          <Select placeholder="Оберіть колір" mode="multiple" disabled={loading}>
            {colors.length > 0 ? (
              colors.map(color => (
                <Option key={`color-${color.id}`} value={color.id}>
                  {color.name}
                </Option>
              ))
            ) : (
              <Option value="" disabled>
                Немає доступних кольорів
              </Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item label="Торгові марки" name="trademark">
          <Select placeholder="Оберіть торгову марку" mode="multiple" disabled={loading}>
            {trademarks.length > 0 ? (
              trademarks.map(tm => (
                <Option key={`trademark-${tm.id}`} value={tm.id}>
                  {tm.tmName || tm.name}
                </Option>
              ))
            ) : (
              <Option value="" disabled>
                Немає доступних торгових марок
              </Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item label="Будинки" name="house">
          <Select placeholder="Оберіть будинок" mode="multiple" disabled={loading}>
            {houses.length > 0 ? (
              houses.map((house: any) => (
                <Option key={`house-${house.id}`} value={house.id}>
                  {house.name}
                </Option>
              ))
            ) : (
              <Option value="" disabled>
                Немає доступних будинків
              </Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Оновити Віджет
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditWidgetForm;
