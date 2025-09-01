import React, { useState } from "react";
import { Typography, Card } from "antd";
import TableWithActions from "../../components/TableWithActions";
import AddHouseForm from "./AddHouseForm";

const { Title } = Typography;

const HousesPage: React.FC = () => {
  const [reloadKey, setReloadKey] = useState(0);

  const refreshTable = () => {
    setReloadKey((prevKey) => prevKey + 1);
  };
  const columnsConfig = [
    { title: "Назва будинку", dataIndex: "name", key: "name" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Будинки</Title>
      <Card style={{ marginBottom: "20px" }}>
        <AddHouseForm refreshTable={refreshTable} />
      </Card>
      <TableWithActions
        parentCollectionName="languages"
        subCollectionName="houses"
        columnsConfig={columnsConfig}
        key={reloadKey} 
      />
    </div>
  );
};

export default HousesPage;