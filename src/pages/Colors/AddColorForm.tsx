import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  Modal,
  Select,
  Upload,
  message,
  Space,
} from "antd";
import { UploadOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { addColorToLanguage } from "../../services/colorService";
import { getLanguages } from "../../services/languageService";
import { uploadTexture } from "../../services/storageService";
import { getTrademarks } from "../../services/trademarkService";

const { Option } = Select;

const AddColorForm: React.FC<{ refreshTable: () => void }> = ({ refreshTable }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [trademarks, setTrademarks] = useState<{ id: string; tmName: string }[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [trademarkFields, setTrademarkFields] = useState<{ id: string; fileList: any[] }[]>([]);

  const handleOpenModal = async () => {
    try {
      const langs = await getLanguages();
      setLanguages(langs);

      if (langs.length > 0) {
        const tms = await getTrademarks(langs[0].id);
        setTrademarks(tms);
      }
    } catch (error) {
      message.error("Не вдалося завантажити мови або торгові марки.");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setFileList([]);
    setTrademarkFields([]);
    setIsModalOpen(false);
    setLoading(false);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);

    if (!values.language || trademarkFields.length === 0) {
      message.error("Будь ласка, виберіть мову та додайте хоча б одну торгову марку!");
      setLoading(false);
      return;
    }

    try {
      
      const trademarksData = await Promise.all(
        trademarkFields.map(async (tmField) => {
          const selectedTrademark = trademarks.find((tm) => tm.id === tmField.id);
          const trademarkTextureFile = tmField.fileList[0]?.originFileObj;

          let trademarkTextureUrl = null;
          if (trademarkTextureFile) {
            trademarkTextureUrl = await uploadTexture(trademarkTextureFile);
          }

          return {
            trademarkId: tmField.id,
            trademarkName: selectedTrademark?.tmName || "",
            trademarkTextureUrl,
          };
        })
      );

      const dataToSend = {
        colorName: values.colorName,
        trademarks: trademarksData,
      };

      await addColorToLanguage(values.language, dataToSend);
      message.success("Кольор успішно додано!");
      handleCloseModal();
      refreshTable();
    } catch (error) {
      message.error("Не вдалося додати кольор.");
    } finally {
      setLoading(false);
    }
  };

  const handleFailedSubmit = () => {
    message.error("Не вдалося додати кольор.");
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const handleTrademarkTextureUploadChange = (tmId: string, { fileList }: any) => {
    setTrademarkFields((prev) =>
      prev.map((tm) => (tm.id === tmId ? { ...tm, fileList } : tm))
    );
  };

  const addTrademarkField = () => {
    setTrademarkFields([...trademarkFields, { id: "", fileList: [] }]);
  };

  const removeTrademarkField = (index: number) => {
    setTrademarkFields((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Button type="primary" onClick={handleOpenModal}>
        Додати кольор
      </Button>
      <Modal title="Додати кольор" open={isModalOpen} onCancel={handleCloseModal} footer={null}>
        <Form form={form} onFinish={handleSubmit} onFinishFailed={handleFailedSubmit} layout="vertical">
          <Form.Item label="Виберіть мову" name="language" rules={[{ required: true, message: "Будь ласка, виберіть мову!" }]}>
            <Select
              placeholder="Оберіть мову"
              onChange={async (languageId) => {
                const tms = await getTrademarks(languageId);
                setTrademarks(tms);
                setTrademarkFields([]);
              }}
            >
              {languages.map((lang) => (
                <Option key={lang.id} value={lang.id}>
                  {lang.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Назва кольору" name="colorName" rules={[{ required: true, message: "Будь ласка, введіть назву кольору!" }]}>
            <Input placeholder="Наприклад, Червоний" />
          </Form.Item>

     {/*      <Form.Item label="Завантажити текстуру кольору" rules={[{ required: true, message: "Будь ласка, завантажте файл!" }]}>
            <Upload listType="picture" fileList={fileList} onChange={handleUploadChange} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Завантажити</Button>
            </Upload>
          </Form.Item>
 */}
          {trademarkFields.map((tmField, index) => (
            <Space key={index} style={{ display: "flex", flexDirection: "column", marginBottom: 8 }} align="baseline">
              <Select
                placeholder="Оберіть торгову марку"
                value={tmField.id}
                onChange={(value) =>
                  setTrademarkFields((prev) =>
                    prev.map((tm, i) => (i === index ? { ...tm, id: value } : tm))
                  )
                }
                style={{ width: 300 }}
              >
                {trademarks.map((tm) => (
                  <Option key={tm.id} value={tm.id}>
                    {tm.tmName}
                  </Option>
                ))}
              </Select>

              <Upload
                listType="picture"
                fileList={tmField.fileList}
                onChange={(info) => handleTrademarkTextureUploadChange(tmField.id, info)}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Завантажити</Button>
              </Upload>

              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                onClick={() => removeTrademarkField(index)}
              />
            </Space>
          ))}

          <Button style={{ marginBottom: 20 }} type="dashed" onClick={addTrademarkField} block icon={<PlusOutlined />}>
            Додати торгову марку
          </Button>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Додати кольор
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddColorForm;