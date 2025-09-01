import React from "react";
import { Button, Menu, ConfigProvider, Layout } from "antd";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import LanguagePage from "../Language/LanguagePage";
import TMPage from "../TM/TMPage";
import ColorsPage from "../Colors/ColorsPage";
import HousesPage from "../Houses/HousesPage";
import ImagesPage from "../Images/ImagesPage";
import Widgets from "../Widgets/Widget";

const { Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/login");
  };

  const currentPath = location.pathname;

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={200} theme="light" style={{ padding: 10 }}>
          <Menu
            mode="inline"
            onClick={({ key }) => navigate(key)}
            selectedKeys={[currentPath]} 
            items={[
              { key: "/dashboard/language", label: "Мови" },
              { key: "/dashboard/tm", label: "ТМ" },
              { key: "/dashboard/colors", label: "Кольори" },
              { key: "/dashboard/houses", label: "Будинки" },
              { key: "/dashboard/images", label: "Зображення" },
              { key: "/dashboard/widgets", label: "Віджети" },
            ]}
          />
          <Button
            style={{ width: "100%", marginTop: 20 }}
            type="primary"
            onClick={handleLogout}
          >
            Вийти
          </Button>
        </Sider>

        <Layout>
          <Content style={{ padding: 20 }}>
            <Routes>
              <Route path="language" element={<LanguagePage />} />
              <Route path="tm" element={<TMPage />} />
              <Route path="colors" element={<ColorsPage />} />
              <Route path="houses" element={<HousesPage />} />
              <Route path="images" element={<ImagesPage />} />
              <Route path="widgets" element={<Widgets />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;