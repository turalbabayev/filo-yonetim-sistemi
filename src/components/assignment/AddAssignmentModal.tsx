import { useState, useEffect } from 'react';
import { Modal, Button, Form, DatePicker, Select, Input } from 'antd';
import { AssignmentInput } from '@/types';
import { VehicleService, AssignmentService } from '@/lib/firebase/services';
import { Vehicle } from '@/types';
import { message } from 'antd';
import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  driverId: string;
}

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export const AddAssignmentModal = ({ isOpen, onClose, onSuccess, driverId }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehiclesData = await VehicleService.getAll();
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Araçlar yüklenirken hata oluştu:', error);
        message.error('Araçlar yüklenirken bir hata oluştu');
      }
    };

    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Form değerlerini doğrudan form.validateFields() ile al
      const formValues = await form.validateFields();
      const [startDate, endDate] = formValues.dateRange;
      
      // Seçilen tarihleri Firebase Timestamp'e çevir
      const assignmentData: AssignmentInput = {
        vehicleId: formValues.vehicleId,
        driverId: driverId,
        title: formValues.title,
        description: formValues.description,
        startTime: Timestamp.fromDate(startDate.toDate()),
        endTime: Timestamp.fromDate(endDate.toDate()),
        status: 'active',
        kilometers: 0
      };

      // Araç müsaitlik kontrolü
      const isAvailable = await AssignmentService.checkVehicleAvailability(
        formValues.vehicleId,
        startDate.toDate(),
        endDate.toDate()
      );

      if (!isAvailable) {
        message.error('Seçilen tarih aralığında araç başka bir sürücüye atanmış');
        return;
      }

      // Görevi ekle
      await AssignmentService.add(assignmentData);
      message.success('Araç ataması başarıyla oluşturuldu');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Araç atama hatası:', error);
      message.error('Araç atama işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Yeni Görev"
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
          name="title"
          label="Görev Başlığı"
          rules={[{ required: true, message: 'Lütfen görev başlığını girin' }]}
        >
          <Input placeholder="Görev başlığını girin" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
          rules={[{ required: true, message: 'Lütfen görev açıklamasını girin' }]}
        >
          <TextArea rows={4} placeholder="Görev açıklamasını girin" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Görev Tarihi"
          rules={[{ required: true, message: 'Lütfen görev tarihini seçin' }]}
        >
          <RangePicker 
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
            placeholder={['Başlangıç Tarihi', 'Bitiş Tarihi']}
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
            Görev Oluştur
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}; 