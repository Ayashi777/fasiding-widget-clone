import React, { useState, useEffect } from "react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import { addWidget } from "../../services/widgetService";
import { getColorsWithTrademarks } from "../../services/colorService";
import { getHouses } from "../../services/houseService";
import { getLanguages } from "../../services/languageService";
import { getTrademarks } from "../../services/trademarkService";

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

const AddWidgetForm: React.FC<{ refreshTable: () => void }> = ({ refreshTable }) => {
  const [form] = Form.useForm();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [colors, setColors] = useState<ColorData[]>([]);
  const [trademarks, setTrademarks] = useState<Trademark[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const closePopup = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languagesList = await getLanguages();
        setLanguages(languagesList);
      } catch (error) {
        message.error("Не вдалося завантажити мови.");
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const colorsWithTrademarks = await getColorsWithTrademarks(selectedLanguage);
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

          const [tmList, housesList] = await Promise.all([
            getTrademarks(selectedLanguage),
            getHouses(selectedLanguage),
          ]);
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
    const colorWidgetData = values.color.map((colorId: string) => {
      return colors.find(c => c.id === colorId);
    });
    const trademarkWidgetData = values.trademark.map((tmId: string) => {
      return trademarks.find(tm => tm.id === tmId);
    });
    const houseWidgetData = values.house.map((houseId: string) => {
      return houses.find(house => house.id === houseId);
    });

    const widgetData = {
      languageId: values.languageId,
      widgetName: values.widgetName,
      adminEmail: values.adminEmail,
      color: colorWidgetData, 
      trademark: trademarkWidgetData,
      house: houseWidgetData,  
    };

    console.log("widgetData:", JSON.stringify(widgetData, null, 2));

    setLoading(true);
    try {
      await addWidget(widgetData);
      message.success("Віджет успішно додано!");
      form.resetFields();
      setSelectedLanguage(null);
      setColors([]);
      setTrademarks([]);
      setHouses([]);
      refreshTable();
      closePopup();
    } catch (error) {
      message.error("Не вдалося додати Віджет.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={handleOpenModal}>
        Додати новий Віджет
      </Button>
      <Modal
        title="Додати торгову марку"
        open={isModalOpen}
        onCancel={closePopup}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Вибір мови"
            name="languageId"
            rules={[{ required: true, message: "Будь ласка, виберіть мову!" }]}
          >
            <Select placeholder="Оберіть мову" onChange={setSelectedLanguage}>
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
            <Input placeholder="Введіть назву Віджету" />
          </Form.Item>
          <Form.Item
            label="Email адміністратора"
            name="adminEmail"
            rules={[{ required: true, message: "Будь ласка, введіть email!" }]}
          >
            <Input type="email" placeholder="Введіть email адміністратора" />
          </Form.Item>
          <Form.Item label="Кольори" name="color">
            <Select placeholder="Оберіть колір" mode="multiple">
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
            <Select placeholder="Оберіть торгову марку" mode="multiple">
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
            <Select placeholder="Оберіть будинок" mode="multiple">
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
              Додати Віджет
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddWidgetForm;