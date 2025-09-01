import React, { useState } from "react";
import { Button, Form, Input, Collapse, Modal, message } from "antd";
import { addLanguage } from "../../services/languageService";

const { Panel } = Collapse;

const AddLanguageForm: React.FC<{ refreshTable: () => void }> = ({
  refreshTable,
}) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await addLanguage({
        name: values.name,
        code: values.code,
        widget: values.widget || {},
        form: values.form || {},
      });

      message.success("Мову успішно додано!");
      handleCloseModal();
      refreshTable();
    } catch (error) {
      message.error("Помилка! Не вдалося додати мову.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={handleOpenModal}>
        Додати мову
      </Button>
      <Modal
        title="Додати мову"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            widget: {
              tm: "Торгівельна марка",
              selected: "Обрано",
              reset_filters: "Скинути фільтри",
              order_fasad: "Замовити фасад",
              download_pdf: "Завантажити PDF",
              colors: "Кольори",
              about_tm: "Про торгівельну марку",
              choose_fasad: "Обрати фасад",
              fasad_description:
                "Тут ви можете побачити як фасад виглядатиме на будинках різного типу",
              start_description:
                "Для того, щоб почати — оберіть торгівельну марку, або бажаний колір фасаду",
              color_texture_hover:
                "Щоб побачити колір та текстуру фасаду більш детально — наведіть на будь-який доступний колір",
              zoom_image: "Збільшити фото для кращої деталізації",
              choose_tm: "Обрати торгівельну марку",
              color_texture_select:
                "Щоб побачити колір та текстуру фасаду більш детально — виберіть будь-який доступний колір",
              choose_house: "Оберіть тип будинку",
              choose_step_second: "Гарний вибір! Лишилось обрати торгівельну марку, щоб побачити як колір виглядає на панелі обраної форми.",
              choose_step_third: "Тільки подивіться які гарні структури та кольори у цієї торгівельної марки!",
              view_3d: "Побачити 3D модель",
              image_none: "Немає завантажених зображень",
              mobile_pdf: "PDF",
              mobile_filters: "скинути"
            },
            form: {
              leave_request:
                "Залиште заявку і менеджер надасть вам професійну консультацію вже сьогодні!",
              name: "Ім’я",
              your_name: "Ваше ім’я",
              phone_number: "Номер телефону",
              email: "Ел.пошта",
              data_protection:
                "Ваші дані будуть захищені. Ми використовуємо високоякісну систему безпеки.",
              color: "Колір",
              tm: "Торгівельна марка",
              house_type: "Тип будинку",
              selected_fasad: "Обрано фасад",
              get_consultation: "Отримати консультацію",
              thank_you:
                "Дякуємо за ваш вибір! Менеджер зателефонує впродовж дня!",
              ok: "Добре",
              enter_phone: "Введіть номер телефону",
              enter_email: "Введіть email",
              enter_name: "Введіть ваше ім’я",
              letter_header: "Нова заявка з віджету",
              letter_subject: "Дякуємо за звернення!",
              letter_thanku: "Дякуємо",
              letter_feedback: "Ми отримали вашу заявку. Найближчим часом з вами зв’яжеться наш спеціаліст.",
              letter_pdf: "Ви можете завантажити PDF з інформацією про вибраний продукт"
            },
          }}
        >
          <Form.Item
            label="Назва мови"
            name="name"
            rules={[
              { required: true, message: "Будь ласка, введіть назву мови!" },
            ]}
          >
            <Input placeholder="Наприклад, Українська" />
          </Form.Item>
          <Form.Item
            label="Код мови"
            name="code"
            rules={[
              { required: true, message: "Будь ласка, введіть код мови!" },
            ]}
          >
            <Input placeholder="Наприклад, uk" />
          </Form.Item>

          <Collapse defaultActiveKey={["widget", "form"]}>
            <Panel header="Віджет" key="widget">
              <Form.Item
                label="1. Торгівельна марка"
                name={["widget", "tm"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="2. Обрано"
                name={["widget", "selected"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="3. Скинути фільтри"
                name={["widget", "reset_filters"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="4. Замовити фасад"
                name={["widget", "order_fasad"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="5. Завантажити PDF"
                name={["widget", "download_pdf"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="6. Кольори"
                name={["widget", "colors"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="7. Про торгівельну марку"
                name={["widget", "about_tm"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="8. Обрати фасад"
                name={["widget", "choose_fasad"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="9. Тут ви можете побачити як фасад виглядатиме на будинках різного типу"
                name={["widget", "fasad_description"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть опис!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="10. Для того, щоб почати — оберіть торгівельну марку, або бажаний колір фасаду"
                name={["widget", "start_description"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть опис!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="11. Щоб побачити колір та текстуру фасаду більш детально — наведіть на будь-який доступний колір"
                name={["widget", "color_texture_hover"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть опис!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="12. Збільшити фото для кращої деталізації"
                name={["widget", "zoom_image"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="13. Обрати торгівельну марку"
                name={["widget", "choose_tm"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="14. Щоб побачити колір та текстуру фасаду більш детально — виберіть будь-який доступний колір"
                name={["widget", "color_texture_select"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть опис!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="15. Оберіть тип будинку"
                name={["widget", "choose_house"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="16. Тільки подивіться які гарні структури та кольори у цієї торгівельної марки!"
                name={["widget", "choose_step_third"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="17. Побачити 3D модель"
                name={["widget", "view_3d"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="18. Гарний вибір! Лишилось обрати торгівельну марку, щоб побачити як колір виглядає на панелі обраної форми."
                name={["widget", "choose_step_second"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="19. Немає завантажених зображень"
                name={["widget", "image_none"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="21. PDF"
                name={["widget", "mobile_pdf"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="22. скинути"
                name={["widget", "mobile_filters"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Panel>
            <Panel header="Форма" key="form">
              <Form.Item
                label="1. Залиште заявку і менеджер надасть вам професійну консультацію вже сьогодні!"
                name={["form", "leave_request"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="2. Ім’я"
                name={["form", "name"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="3. Ваше ім’я"
                name={["form", "your_name"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="4. Номер телефону"
                name={["form", "phone_number"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="5. Ел.пошта"
                name={["form", "email"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="6. Гарантія захисту даних"
                name={["form", "data_protection"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть опис!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="7. Колір"
                name={["form", "color"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="8. Торгівельна марка"
                name={["form", "tm"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="9. Тип будинку"
                name={["form", "house_type"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="10. Обрано фасад"
                name={["form", "selected_fasad"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="11. Отримати консультацію"
                name={["form", "get_consultation"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="12. Дякуємо за ваш вибір! Менеджер зателефонує впродовж дня!"
                name={["form", "thank_you"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть текст!" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="13. Добре"
                name={["form", "ok"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть переклад!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="14. Введіть номер телефону"
                name={["form", "enter_phone"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть текст!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="15. Введіть email"
                name={["form", "enter_email"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть текст!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="16. Введіть ваше ім'я"
                name={["form", "enter_name"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть текст!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="17. Нова заявка з віджету"
                name={["form", "letter_header"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть текст!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="18. Дякуємо за звернення!"
                name={["form", "letter_subject"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть текст!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="19. Дякуємо"
                name={["form", "letter_thanku"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть текст!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="20. Ми отримали вашу заявку. Найближчим часом з вами зв’яжеться наш спеціаліст."
                name={["form", "letter_feedback"]}
                rules={[
                  { required: true, message: "Будь ласка, введіть текст!" },
                ]}
              >
                <Input />
              </Form.Item>

            </Panel>
          </Collapse>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Додати мову
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddLanguageForm;
