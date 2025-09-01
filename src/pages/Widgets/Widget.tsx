import React, { useState } from "react";
import { Modal, Typography, Space, Card, Button, Input, message } from "antd";
import AddWidgetForm from "./AddWidgetForm";
import EditWidgetForm from "./EditWidgetForm";
import TableWithActions from "../../components/TableWithActions";
import { Link } from "react-router-dom";

const { Title } = Typography;

const Widget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [iframeCode, setIframeCode] = useState("");

  const refreshTable = () => {
    setReloadKey((prevKey) => prevKey + 1);
  };

  const generateIframeCode = (widgetId: string) => {
    const domain = window.location.origin;
    const iframe = `<iframe src="${domain}/widgets/${widgetId}" width="100%" height="100%" style="border:none; display: block;"></iframe>
  <script>
    window.addEventListener('message', function(e) {
      var iframe = document.querySelector('iframe[src="${domain}/widgets/${widgetId}"]');
      if (iframe && e.data.type === 'resize' && e.data.height) {
        iframe.style.height = e.data.height + 'px';
      }
    });
  </script>`;
    setIframeCode(iframe);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode)
      .then(() => {
        message.success("Код скопійовано в буфер обміну!");
      })
      .catch(() => {
        message.error("Не вдалося скопіювати код");
      });
  };

  const handleEdit = (widgetId: string) => {
    setEditingWidgetId(widgetId);
  };

  const handleCloseEditModal = () => {
    setEditingWidgetId(null);
  };

  const columnsConfig = [
    { 
      title: "Назва віджету", 
      dataIndex: "widgetName", 
      key: "widgetName",
      render: (text: string, record: any) => (
        <Link to={`/widgets/${record.id}`}>{text}</Link>
      ),
    },
    { 
      title: "Email адміністратора", 
      dataIndex: "adminEmail", 
      key: "adminEmail" 
    },
    {
      title: "Дія",
      dataIndex: "action",
      key: "action",
      render: (text: string, record: any) => (
        <>
          <Button type="link" onClick={() => generateIframeCode(record.id)}>
            Копіювати iframe
          </Button>
          <Button type="link" onClick={() => handleEdit(record.id)}>
            Редагувати
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Віджети</Title>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Card style={{ marginBottom: "20px" }}>
          <AddWidgetForm refreshTable={refreshTable} />
        </Card>
      </Space>

      <TableWithActions
        parentCollectionName="widgets"
        columnsConfig={columnsConfig}
        key={reloadKey}
      />

      <Modal
        title="Додати новий виджет"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <AddWidgetForm refreshTable={refreshTable} />
      </Modal>

      {editingWidgetId && (
        <EditWidgetForm
          widgetId={editingWidgetId}
          refreshTable={refreshTable}
          onClose={handleCloseEditModal}
        />
      )}

      {iframeCode && (
        <div style={{ marginTop: "20px" }}>
          <Input.TextArea value={iframeCode} readOnly style={{ height: "100px" }} />
          <Button onClick={handleCopyToClipboard} style={{ marginTop: "10px" }}>
            Копіювати код
          </Button>
        </div>
      )}
    </div>
  );
};

export default Widget;