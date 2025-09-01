import React, { useState } from "react";
import { Button, Form, Input, Typography, Alert } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const LoginForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigate("/dashboard/language"); 
    } catch (err) {
      setError("Помилка входу. Перевірте правильність електронної пошти та пароля.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: "20px", border: "1px solid #f0f0f0", borderRadius: 8 }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Вхід
      </Title>
      {error && <Alert message={error} type="error" style={{ marginBottom: 20 }} />}
      <Form name="login" onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Електронна пошта"
          name="email"
          rules={[
            { required: true, message: "Будь ласка, введіть вашу електронну пошту!" },
            { type: "email", message: "Введіть дійсну електронну пошту!" },
          ]}
        >
          <Input placeholder="Введіть вашу електронну пошту" />
        </Form.Item>
        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: "Будь ласка, введіть ваш пароль!" }]}
        >
          <Input.Password placeholder="Введіть ваш пароль" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Увійти
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
