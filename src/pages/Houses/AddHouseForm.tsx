import React, { useState, useEffect } from "react";
import { Button, Form, Input, Modal, message, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getLanguages, addHouse } from "../../services/houseService";

const { Option } = Select;

const AddHouseForm: React.FC<{ refreshTable: () => void }> = ({ refreshTable }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langs = await getLanguages();
        setLanguages(langs);
      } catch {
        message.error("Не вдалося завантажити мови.");
      }
    };

    fetchLanguages();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setFileList([]);
    setIsModalOpen(false);
    setLoading(false);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (!values.language) {
        message.error("Будь ласка, виберіть мову!");
        return;
      }

      const file = fileList[0]?.originFileObj;
      await addHouse(values.language, values.name, file);

      message.success("Будинок успішно додано!");
      handleCloseModal();
      refreshTable();
    } catch {
      message.error("Не вдалося додати будинок.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  return (
    <>
      <Button type="primary" onClick={handleOpenModal}>
        Додати будинок
      </Button>
      <Modal
        title="Додати будинок"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Виберіть мову"
            name="language"
            rules={[{ required: true, message: "Будь ласка, виберіть мову!" }]}
          >
            <Select placeholder="Оберіть мову">
              {languages.map((lang) => (
                <Option key={lang.id} value={lang.id}>
                  {lang.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Назва будинку"
            name="name"
            rules={[{ required: true, message: "Будь ласка, введіть назву будинку!" }]}
          >
            <Input placeholder="Наприклад, Будинок A" />
          </Form.Item>
          <Form.Item label="Іконка будинку">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Завантажити іконку</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Додати будинок
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddHouseForm;
