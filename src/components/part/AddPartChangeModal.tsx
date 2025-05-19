import { useState, useEffect } from 'react';
import { Modal, Button, Form, DatePicker, Select, Input, InputNumber, Radio } from 'antd';
import { PartChangeInput, PaymentType } from '@/types';
import { VehicleService, PartChangeService } from '@/lib/firebase/services';
import { Vehicle } from '@/types';
import { message } from 'antd';
import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { TextArea } = Input;

export const AddPartChangeModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      VehicleService.getAll().then(data => {
        setVehicles(data.filter(v => v.status === 'active'));
      });
    }
  }, [isOpen]);

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.error('Oturum bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);

      const partChangeData: PartChangeInput = {
        vehicleId: values.vehicleId,
        partName: values.partName,
        description: values.description,
        date: Timestamp.fromDate(values.date.toDate()),
        cost: values.cost,
        paymentType: values.paymentType as PaymentType,
        createdBy: user.id
      };

      await PartChangeService.add(partChangeData);
      message.success('Parça değişimi kaydı başarıyla oluşturuldu');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Parça değişimi kaydı hatası:', error);
      message.error('Parça değişimi kaydı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Yeni Parça Değişimi"
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="vehicleId"
          label="Araç"
          rules={[{ required: true, message: 'Lütfen bir araç seçin' }]}
        >
          <Select placeholder="Araç seçin">
            {vehicles.map(vehicle => (
              <Select.Option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.brand} {vehicle.model}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="partName"
          label="Parça Adı"
          rules={[{ required: true, message: 'Lütfen parça adını girin' }]}
        >
          <Input placeholder="Değişen parçanın adını girin" />
        </Form.Item>

        <Form.Item
          name="date"
          label="Değişim Tarihi"
          rules={[{ required: true, message: 'Lütfen değişim tarihini seçin' }]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            placeholder="Değişim tarihi seçin"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
          rules={[{ required: true, message: 'Lütfen değişim açıklamasını girin' }]}
        >
          <TextArea rows={4} placeholder="Değişim detaylarını girin" />
        </Form.Item>

        <Form.Item
          name="paymentType"
          label="Ödeme Türü"
          rules={[{ required: true, message: 'Lütfen ödeme türünü seçin' }]}
        >
          <Radio.Group>
            <Radio.Button value="kasko">Kasko</Radio.Button>
            <Radio.Button value="ucretli">Ücretli</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="cost"
          label="Maliyet (TL)"
          rules={[{ required: true, message: 'Lütfen değişim maliyetini girin' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder="Değişim maliyetini girin"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
          >
            Parça Değişimi Kaydı Oluştur
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}; 