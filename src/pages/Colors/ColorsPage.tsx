import React, { useState } from "react";
import { Typography, Card } from "antd";
import AddColorForm from "./AddColorForm";
import TableWithActions from "../../components/TableWithActions";

const { Title } = Typography;

const ColorsPage: React.FC = () => {
  const [reloadKey, setReloadKey] = useState(0);

  const refreshTable = () => {
    setReloadKey((prevKey) => prevKey + 1);
  };

  const columnsConfig = [
    { title: "Назва кольору", dataIndex: "colorName", key: "colorName" },
    {
      title: "Торгові марки",
      dataIndex: "trademarks",
      key: "trademarks",
      render: (trademarks: { trademarkName: string; trademarkTextureUrl?: string }[]) =>
        trademarks.length > 0 ? (
          <div>
            {trademarks.map((tm, index) => (
              <div key={index}>
                {tm.trademarkName}
              </div>
            ))}
          </div>
        ) : (
          "Немає"
        ),
    },
  ];
  

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Кольори</Title>
      <Card style={{ marginBottom: "20px" }}>
        <AddColorForm refreshTable={refreshTable} />
      </Card>
      <TableWithActions
        parentCollectionName="languages"
        subCollectionName="colors"
        columnsConfig={columnsConfig}
        key={reloadKey}
        
      />
    </div>
  );
};

export default ColorsPage;
