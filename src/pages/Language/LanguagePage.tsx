import React, { useState } from "react";
import TableWithActions from "../../components/TableWithActions";
import AddLanguageForm from "./AddLanguageForm";
import { Row, Col, Typography, Space, Card } from "antd";

const { Title } = Typography;

const LanguagePage: React.FC = () => {
  const [reloadKey, setReloadKey] = useState(0);

  const refreshTable = () => {
    setReloadKey((prevKey) => prevKey + 1);
  };

  const columnsConfig = [
    { title: "Назва мови", dataIndex: "name", key: "name" },
    { title: "Код мови", dataIndex: "code", key: "code" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>Мови</Title>
        </Col>

        <Col span={24}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Card style={{ marginBottom: "20px" }}>
              <AddLanguageForm refreshTable={refreshTable} />
            </Card>
          </Space>
        </Col>

        <Col span={24}>
          <TableWithActions
            parentCollectionName="languages"
            columnsConfig={columnsConfig}
            key={reloadKey}
          />
        </Col>
      </Row>
    </div>
  );
};

export default LanguagePage;
