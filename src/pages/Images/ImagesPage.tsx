import React, { useState, useEffect } from "react";
import { Typography, Card, message } from "antd";
import AddImagesForm from "./AddImagesForm";
import TableWithActions from "../../components/TableWithActions";
import { getHouses } from "../../services/houseService";

const { Title } = Typography;

const ImagesPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const housesData = await getHouses("languageId"); 
        setHouses(housesData);
      } catch (error) {
        message.error("Помилка завантаження будинків:");
      }
    };

    fetchHouses();
  }, []);

  const handleImageAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const columnsConfig = [
    { title: "Назва будинку", dataIndex: "houseName", key: "houseName" },
    { title: "Назва кольору", dataIndex: "colorName", key: "colorName" },
    { title: "Назва ТМ", dataIndex: "trademarkName", key: "trademarkName" },
    { 
      title: "Зображення", 
      dataIndex: "imageUrls", 
      key: "imageUrls", 
      render: (url: string) => url ? <img src={url} alt="House Image" style={{ width: 50, height: 50 }} /> : "Немає" 
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Зображення</Title>
      <Card style={{ marginBottom: "20px" }}>
        <AddImagesForm onImageAdded={handleImageAdded} />
      </Card>
      <TableWithActions
        key={refreshKey}
        parentCollectionName="languages"
        subCollectionName="images"
        columnsConfig={columnsConfig}
      />
    </div>
  );
};

export default ImagesPage;