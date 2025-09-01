import React, { useState, useEffect } from "react";
import { Table, Button, message, Select } from "antd";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const { Option } = Select;

interface Item {
  id: string;
  languageId?: string;
  [key: string]: any;
}

interface TableWithActionsProps {
  parentCollectionName: string;
  subCollectionName?: string;
  columnsConfig: {
    title: string;
    dataIndex: string;
    key: string;
    render?: (text: any, record: Item) => JSX.Element | string;
  }[];
}

const TableWithActions: React.FC<TableWithActionsProps> = ({
  parentCollectionName,
  subCollectionName,
  columnsConfig,
}) => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
  const [languageMap, setLanguageMap] = useState<{ [key: string]: string }>({}); 

  useEffect(() => {
    if (subCollectionName) {
      const fetchLanguages = async () => {
        try {
          const snapshot = await getDocs(collection(db, "languages"));
          const langs = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));

          setLanguages(langs);
          const langMap: { [key: string]: string } = {};
          langs.forEach((lang) => {
            langMap[lang.id] = lang.name; 
          });
          setLanguageMap(langMap);
        } catch (error) {
          message.error("Не вдалося завантажити список мов.");
        }
      };
      fetchLanguages();
    }
  }, [subCollectionName]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const items: Item[] = [];

        if (subCollectionName) {
          const languagesSnapshot = await getDocs(collection(db, "languages"));

          for (const langDoc of languagesSnapshot.docs) {
            if (selectedLanguage && langDoc.id !== selectedLanguage) continue;

            const subCollectionRef = collection(langDoc.ref, subCollectionName);
            const subCollectionSnapshot = await getDocs(subCollectionRef);

            subCollectionSnapshot.docs.forEach((doc) => {
              items.push({
                id: doc.id,
                languageId: langDoc.id,
                ...doc.data(),
              });
            });
          }
        } else {
          const snapshot = await getDocs(collection(db, parentCollectionName));
          snapshot.docs.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
        }

        setData(items);
      } catch (error: any) {
        message.error(`Не вдалося завантажити дані. Помилка: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parentCollectionName, subCollectionName, selectedLanguage]);

  const handleDelete = async (id: string, languageId?: string) => {
    try {
      if (subCollectionName && languageId) {
        const docRef = doc(db, `languages/${languageId}/${subCollectionName}`, id);
        await deleteDoc(docRef);
      } else {
        const docRef = doc(db, parentCollectionName, id);
        await deleteDoc(docRef);
      }
      setData((prevData) => prevData.filter((item) => item.id !== id));
      message.success("Елемент видалено.");
    } catch (error: any) {
      message.error(`Не вдалося видалити елемент. Помилка: ${error.message}`);
    }
  };

  return (
    <div>
      {subCollectionName && (
        <Select
        style={{ width: 300, marginBottom: 20 }}
        placeholder="Виберіть мову"
        allowClear
        onChange={(value) => setSelectedLanguage(value || undefined)} 
        value={selectedLanguage || undefined} 
      >
        <Option value="">Всі мови</Option>
        {languages.map((lang) => (
          <Option key={lang.id} value={lang.id}>
            {lang.name}
          </Option>
        ))}
      </Select>
      
      )}

      <Table
        dataSource={data}
        rowKey="id"
        loading={loading}
        columns={[
          ...columnsConfig,
          ...(subCollectionName
            ? [
              {
                title: "Мова",
                dataIndex: "languageId",
                key: "languageId",
                render: (languageId: string | undefined) => languageMap[languageId || ""] || "—",
              },
              ]
            : []),
          {
            title: "Дії",
            key: "actions",
            render: (_, record) => (
              <Button
                type="link"
                danger
                onClick={() => handleDelete(record.id, record.languageId)}
              >
                Видалити
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
};

export default TableWithActions;
