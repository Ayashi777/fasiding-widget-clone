import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Upload,
  message,
  UploadFile,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { convertToWebp } from "../../utils/imageUtils";
import { addTrademark } from "../../services/trademarkService";
import { getLanguages } from "../../services/languageService";
import { getColors } from "../../services/colorService";
import { v4 as uuidv4 } from "uuid";

const { Option } = Select;

interface Language {
  id: string;
  name: string;
}

interface Advantage {
  text: string;
  image: File | string | null;
}

interface TrademarkColor {
  name: string;
  image: File | string | null;
  pdf: File | string | null;
}

interface AddTMFormProps {
  refreshTable: () => void;
}

const AddTMForm: React.FC<AddTMFormProps> = ({ refreshTable }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [nameUrlFileList, setNameUrlFileList] = useState<UploadFile[]>([]);
  const [fasadFileList, setFasadFileList] = useState<UploadFile[]>([]);
  const [fasadMobileFileList, setFasadMobileFileList] = useState<UploadFile[]>([]);
  const [advantages, setAdvantages] = useState<Advantage[]>([]);
  const [pdfFileList, setPdfFileList] = useState<UploadFile[]>([]);
  const [trademarkColors, setTrademarkColors] = useState<TrademarkColor[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const languagesData = await getLanguages();
        const selectedLanguage = languagesData[0] || null;
        const colorsData = selectedLanguage ? await getColors(selectedLanguage.id) : [];
        setLanguages(languagesData);
        setColors(colorsData);
      } catch (error) {
        message.error("Помилка при завантаженні даних.");
      }
    };
    fetchData();
  }, []);

  const handleAddAdvantage = () => {
    setAdvantages((prev) => [...prev, { text: "", image: null }]);
  };

  const handleRemoveAdvantage = (index: number) => {
    setAdvantages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdvantageChange = (index: number, field: keyof Advantage, value: any) => {
    setAdvantages((prev) =>
      prev.map((adv, i) => (i === index ? { ...adv, [field]: value } : adv))
    );
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleAddColor = () => {
    setTrademarkColors((prev) => [...prev, { name: "", image: null, pdf: null }]);
  };

  const handleRemoveColor = (index: number) => {
    setTrademarkColors((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
      const optimizedFile = file.type.startsWith("image/") && path !== "pdfs" ? await convertToWebp(file) : file;
      const storage = getStorage();
      const uniqueFileName = `${uuidv4()}_${optimizedFile.name}`;
      const storageRef = ref(storage, `${path}/${uniqueFileName}`);
      await uploadBytes(storageRef, optimizedFile);
      return getDownloadURL(storageRef);
    } catch (error) {
      console.error(`Помилка завантаження файлу: ${error}`);
      throw error;
    }
  };

  const handleColorChange = (index: number, field: keyof TrademarkColor, value: any) => {
    setTrademarkColors((prev) =>
      prev.map((color, i) => (i === index ? { ...color, [field]: value } : color))
    );
  };

  const handleColorPdfUploadChange = (index: number, { fileList }: { fileList: UploadFile[] }) => {
    const newColors = [...trademarkColors];
    if (fileList.length > 0 && fileList[0].originFileObj) {
      newColors[index].pdf = fileList[0].originFileObj;
    } else {
      newColors[index].pdf = null;
    }
    setTrademarkColors(newColors);
  };

  const handlePdfUploadChange = async ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setPdfFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      try {
        const fileUrl = await uploadFile(newFileList[0].originFileObj, "pdfs");
        setPdfFileList([{ ...newFileList[0], url: fileUrl }]);
      } catch (error) {
        message.error("Помилка при завантаженні PDF!");
        setPdfFileList([]);
      }
    }
  };

  const handleCloseModal = () => {
    form.resetFields();
    setFileList([]);
    setNameUrlFileList([]);
    setFasadFileList([]);
    setAdvantages([]);
    setTrademarkColors([]);
    setFasadMobileFileList([]);
    setPdfFileList([]);
    setIsModalOpen(false);
    setLoading(false);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const logoUrl = fileList[0]?.originFileObj
        ? await uploadFile(fileList[0].originFileObj, "logos")
        : null;
      const nameUrl = nameUrlFileList[0]?.originFileObj
        ? await uploadFile(nameUrlFileList[0].originFileObj, "logos")
        : null;
      const desktopAdvantageUrl = fasadFileList[0]?.originFileObj
        ? await uploadFile(fasadFileList[0].originFileObj, "advantages")
        : null;
      const mobileAdvantageUrl = fasadMobileFileList[0]?.originFileObj
        ? await uploadFile(fasadMobileFileList[0].originFileObj, "advantages")
        : null;

      const advantagesFormatted = await Promise.all(
        advantages.map(async (adv) => ({
          text: adv.text,
          image: adv.image && adv.image instanceof File ? await uploadFile(adv.image, "advantages") : adv.image,
        }))
      );

      const colorsFormatted = await Promise.all(
        trademarkColors.map(async (color) => ({
          name: color.name,
          image: color.image && color.image instanceof File ? await uploadFile(color.image, "colors") : color.image,
          pdf: color.pdf && color.pdf instanceof File ? await uploadFile(color.pdf, "color-pdfs") : color.pdf,
        }))
      );

      const pdfUrl = pdfFileList[0]?.url || null;

      const dataToSave = {
        tmName: values.tmName,
        language: values.language,
        description: values.description,
        colorTm: values.colorTm,
        colors: colorsFormatted,
        logoUrl,
        nameUrl,
        mobileAdvantageUrl,
        desktopAdvantageUrl,
        advantages: advantagesFormatted,
        pdfUrl,
      };

      await addTrademark(dataToSave);
      message.success("Торгова марка успішно додана!");
      handleCloseModal();
      refreshTable();
    } catch (error) {
      message.error("Неможливо додати торгову марку.");
      setLoading(false);
    }
  };

  const handleFailedSubmit = (errorInfo: any) => {
    message.error("Помилка при відправці форми. Перевірте введені дані.");
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const handleNameUrlUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setNameUrlFileList(newFileList);
  };

  const handleFasadUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFasadFileList(newFileList);
  };

  const handleFasadMobileUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFasadMobileFileList(newFileList);
  };

  return (
    <>
      <Button type="primary" onClick={handleOpenModal}>
        Додати торгову марку
      </Button>
      <Modal
        title="Додати торгову марку"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          onFinishFailed={handleFailedSubmit}
          layout="vertical"
        >
          <Form.Item
            label="Оберіть мову"
            name="language"
            rules={[{ required: true, message: "Будь ласка, виберіть мову!" }]}
          >
            <Select placeholder="Оберіть мову">
              {languages.map((language) => (
                <Option key={language.id} value={language.id}>
                  {language.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Назва торгової марки"
            name="tmName"
            rules={[{ required: true, message: "Будь ласка, введіть назву!" }]}
          >
            <Input placeholder="Назва" />
          </Form.Item>

          <Form.Item label="Додатковий логотип">
            <Upload
              listType="picture"
              fileList={nameUrlFileList}
              onChange={handleNameUrlUploadChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Завантажити зображення</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Опис"
            name="description"
            rules={[{ required: true, message: "Будь ласка, введіть опис!" }]}
          >
            <Input.TextArea placeholder="Опис торгової марки" rows={4} />
          </Form.Item>

          <Form.Item
            label="Hex Код кольору торгової марки"
            name="colorTm"
            rules={[{ required: true, message: "Будь ласка, введіть Колір!" }]}
          >
            <Input placeholder="#FFFFFF" />
          </Form.Item>

          <Form.Item
            label="Логотип торгової марки"
            rules={[{ required: true, message: "Будь ласка, завантажте лого!" }]}
          >
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Завантажити Логотип</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Кольори торгової марки">
            {trademarkColors.map((color, index) => (
              <div key={index} style={{ marginBottom: 16, border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Input
                      placeholder="Назва кольору"
                      value={color.name}
                      onChange={(e) => handleColorChange(index, "name", e.target.value)}
                    />
                  </Col>
                  <Col span={24}>
                    <Upload
                      listType="picture"
                      fileList={
                        color.image
                          ? [
                              {
                                uid: String(index),
                                name: "color-image",
                                url:
                                  color.image instanceof File
                                    ? URL.createObjectURL(color.image)
                                    : color.image,
                              },
                            ]
                          : []
                      }
                      beforeUpload={() => false}
                      onChange={({ fileList }) => {
                        const file = fileList[0];
                        if (file) {
                          handleColorChange(index, "image", file.originFileObj);
                        } else {
                          handleColorChange(index, "image", null);
                        }
                      }}
                    >
                      <Button style={{ margin: "10px 0" }} icon={<UploadOutlined />}>
                        Завантажити текстуру
                      </Button>
                    </Upload>
                  </Col>
                  <Col span={24}>
                    <Upload
                      listType="text"
                      fileList={
                        color.pdf
                          ? [
                              {
                                uid: `pdf-${index}`,
                                name: "color-pdf",
                                url:
                                  color.pdf instanceof File
                                    ? URL.createObjectURL(color.pdf)
                                    : color.pdf,
                              },
                            ]
                          : []
                      }
                      beforeUpload={() => false}
                      onChange={(info) => handleColorPdfUploadChange(index, info)}
                      accept=".pdf"
                    >
                      <Button style={{ margin: "10px 0" }} icon={<UploadOutlined />}>
                        Завантажити PDF для кольору
                      </Button>
                    </Upload>
                  </Col>
                  <Col span={24}>
                    <Button 
                      style={{ margin: "10px 0" }} 
                      danger 
                      onClick={() => handleRemoveColor(index)}
                      block
                    >
                      Видалити колір
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
            <Button type="dashed" onClick={handleAddColor} block>
              Додати колір
            </Button>
          </Form.Item>

          <Form.Item label="Зображення Фасаду">
            <Upload
              listType="picture"
              fileList={fasadFileList}
              onChange={handleFasadUploadChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Завантажити Зображення Фасаду</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Зображення Фасаду на мобільному пристрої">
            <Upload
              listType="picture"
              fileList={fasadMobileFileList}
              onChange={handleFasadMobileUploadChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                Завантажити Зображення Фасаду для мобільного пристрою
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Переваги">
            {advantages.map((advantage, index) => (
              <div key={index} style={{ marginBottom: 16, border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Input
                      placeholder="Перевага"
                      value={advantage.text}
                      onChange={(e) => handleAdvantageChange(index, "text", e.target.value)}
                    />
                  </Col>
                  <Col span={24}>
                    <Upload
                      listType="picture"
                      fileList={
                        advantage.image
                          ? [
                              {
                                uid: String(index),
                                name: `advantage-image-${index}`,
                                url:
                                  advantage.image instanceof File
                                    ? URL.createObjectURL(advantage.image)
                                    : advantage.image,
                              },
                            ]
                          : []
                      }
                      beforeUpload={() => false}
                      onChange={({ fileList }) => {
                        const file = fileList[0];
                        if (file) {
                          handleAdvantageChange(index, "image", file.originFileObj);
                        } else {
                          handleAdvantageChange(index, "image", null);
                        }
                      }}
                    >
                      <Button style={{ margin: "10px 0" }} icon={<UploadOutlined />}>
                        Завантажити картинку
                      </Button>
                    </Upload>
                  </Col>
                  <Col span={24}>
                    <Button 
                      style={{ margin: "10px 0" }} 
                      danger 
                      onClick={() => handleRemoveAdvantage(index)}
                      block
                    >
                      Видалити перевагу
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
            <Button type="dashed" onClick={handleAddAdvantage} block>
              Додати перевагу
            </Button>
          </Form.Item>

      {/*     <Form.Item label="Завантажити PDF файл">
            <Upload
              listType="text"
              fileList={pdfFileList}
              onChange={handlePdfUploadChange}
              beforeUpload={() => false}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />}>Завантажити PDF</Button>
            </Upload>
          </Form.Item> */}

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              Додати торгову марку
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddTMForm;