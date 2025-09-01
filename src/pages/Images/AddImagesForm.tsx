// components/AddImagesForm.tsx
import React, { useState, useEffect } from "react";
import { Button, Form, Select, Upload, Modal, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadImage, addImageToLanguage } from "../../services/imageService";
import { getLanguages } from "../../services/languageService";
import { getTrademarks } from "../../services/trademarkService";
import { getUniqueColorsWithTrademarks } from "../../services/colorService";
import { getHouses } from "../../services/houseService";

const { Option } = Select;

interface AddImagesFormProps {
  onImageAdded: () => void;
}

const AddImagesForm: React.FC<AddImagesFormProps> = ({ onImageAdded }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [trademarks, setTrademarks] = useState<{ id: string; tmName: string }[]>([]);
  const [colors, setColors] = useState<{ id: string; colorName: string; trademarkName: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [selectedTrademark, setSelectedTrademark] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

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
      const fetchHouses = async () => {
        try {
          const housesList = await getHouses(selectedLanguage);
          setHouses(housesList);
        } catch (error) {
          message.error("Не вдалося завантажити будинки.");
        }
      };

      const fetchTrademarks = async () => {
        try {
          const trademarksList = await getTrademarks(selectedLanguage);
          setTrademarks(trademarksList);
        } catch (error) {
          message.error("Не вдалося завантажити торгові марки.");
        }
      };

      fetchHouses();
      fetchTrademarks();
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (selectedLanguage) {
      const fetchColors = async () => {
        try {
          const uniqueColorsList = await getUniqueColorsWithTrademarks(selectedLanguage);
          setColors(uniqueColorsList);
        } catch (error) {
          message.error("Не вдалося завантажити кольори.");
        }
      };
      fetchColors();
    }
  }, [selectedLanguage]);

  // Фільтрація кольорів по вибраній торговій марці
  const filteredColors = selectedTrademark
    ? colors.filter(
        (color) =>
          color.trademarkName === trademarks.find((tm) => tm.id === selectedTrademark)?.tmName
      )
    : [];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setFileList([]);
    setSelectedLanguage(null);
    setSelectedHouse(null);
    setSelectedTrademark(null);
    setSelectedColorId(null);
    setIsModalOpen(false);
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const handleSubmit = async () => {
    if (!selectedLanguage || !selectedHouse || !selectedTrademark || !selectedColorId) {
      message.error("Будь ласка, оберіть мову, будинок, торгову марку та колір!");
      return;
    }
  
    const files = fileList.map((file) => file.originFileObj);
    if (files.length === 0) {
      message.error("Будь ласка, завантажте хоча б одне зображення!");
      return;
    }
  
    try {
      setUploading(true);
  
      const uploadedImages = await Promise.all(files.map((file) => uploadImage(file)));
      const validImageUrls = uploadedImages.filter((url): url is string => url !== null);
  
      if (validImageUrls.length === 0) {
        throw new Error("Не вдалося отримати URL зображення.");
      }
  
      const houseName = houses.find((house) => house.id === selectedHouse)?.name || "";
      const trademarkName = trademarks.find((tm) => tm.id === selectedTrademark)?.tmName || "";
      const colorName = colors.find((color) => color.id === selectedColorId)?.colorName || "";
  
      const imageData = {
        houseId: selectedHouse,
        houseName: houseName,
        trademarkId: selectedTrademark,      // id торгової марки
        trademarkName: trademarkName,          // назва торгової марки
        colorId: selectedColorId,              // id кольору
        colorName: [colorName],
        imageUrls: validImageUrls,
      };
  
      await addImageToLanguage(selectedLanguage, imageData);
  
      message.success("Зображення успішно додано!");
      onImageAdded();
      handleCloseModal();
    } catch (error) {
      message.error("Не вдалося додати зображення.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={handleOpenModal}>
        Додати зображення
      </Button>
      <Modal title="Додати зображення" open={isModalOpen} onCancel={handleCloseModal} footer={null}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item label="Виберіть мову" name="languageId" rules={[{ required: true, message: "Будь ласка, виберіть мову!" }]}>
            <Select placeholder="Оберіть мову" onChange={(value) => setSelectedLanguage(value)}>
              {languages.map((lang) => (
                <Option key={lang.id} value={lang.id}>
                  {lang.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Виберіть будинок" name="houseId" rules={[{ required: true, message: "Будь ласка, виберіть будинок!" }]}>
            <Select placeholder="Оберіть будинок" disabled={!selectedLanguage} onChange={(value) => setSelectedHouse(value)}>
              {houses.map((house) => (
                <Option key={house.id} value={house.id}>
                  {house.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Виберіть торгову марку" name="trademarkId" rules={[{ required: true, message: "Будь ласка, виберіть торгову марку!" }]}>
            <Select placeholder="Оберіть торгову марку" disabled={!selectedLanguage} onChange={(value) => setSelectedTrademark(value)}>
              {trademarks.map((tm) => (
                <Option key={tm.id} value={tm.id}>
                  {tm.tmName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Виберіть колір" name="colorId" rules={[{ required: true, message: "Будь ласка, виберіть колір!" }]}>
            <Select placeholder="Оберіть колір" disabled={!selectedTrademark} onChange={(value) => setSelectedColorId(value)}>
              {filteredColors.map((color) => (
                <Option key={color.id} value={color.id}>
                  {color.colorName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Завантажити зображення">
            <Upload multiple listType="picture" fileList={fileList} onChange={handleUploadChange} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Завантажити</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={uploading}>
              Додати зображення
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddImagesForm;
