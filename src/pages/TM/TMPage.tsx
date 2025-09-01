import React, { useState } from "react";
import { Typography, Card } from "antd";
import TableWithActions from "../../components/TableWithActions";
import AddTMForm from "./AddTMForm";

const { Title } = Typography;

const TMPage: React.FC = () => {
  const [reloadKey, setReloadKey] = useState(0);

  const refreshTable = () => {
    setReloadKey((prevKey) => prevKey + 1);
  };

  const columnsConfig = [
    { title: "Назва Торгової марки", dataIndex: "tmName", key: "tmName" },
    { title: "Опис", dataIndex: "description", key: "description" },
  ];
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Торгові марки</Title>
      <Card style={{ marginBottom: "20px" }}>
        <AddTMForm refreshTable={refreshTable} />
      </Card>
      <TableWithActions
        parentCollectionName="languages"
        subCollectionName="trademarks"
        columnsConfig={columnsConfig}
        key={reloadKey}
      />
    </div>
  );
};

export default TMPage;
