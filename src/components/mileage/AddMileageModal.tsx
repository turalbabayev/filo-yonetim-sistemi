'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, DatePicker, Select, InputNumber, message } from 'antd';
import { MileageService, VehicleService } from '@/lib/firebase/services';
import { Vehicle, MileageInput } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMileageModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastMileage, setLastMileage] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      VehicleService.getAll().then(data => {
        setVehicles(data.filter(v => v.status === 'active'));
      });
    }
  }, [isOpen]);

  const handleVehicleChange = async (vehicleId: string) => {
    try {
      const records = await MileageService.getByVehicle(vehicleId);
      if (records.length > 0) {
        // En son kilometre kaydını al
        const lastRecord = records[0]; // records zaten tarihe göre desc sıralı geliyor
        setLastMileage(lastRecord.mileage);
      } else {
        setLastMileage(null);
      }
    } catch (error) {
      console.error('Önceki kilometre verisi alınırken hata:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!user) {
        throw new Error('Kullanıcı oturum açmamış');
      }

      // Yeni kilometre değeri öncekinden küçük olmamalı
      if (lastMileage !== null && values.mileage <= lastMileage) {
        message.error('Yeni kilometre değeri önceki değerden büyük olmalıdır');
        return;
      }

      const mileageInput: MileageInput = {
        vehicleId: values.vehicleId,
        mileage: values.mileage,
        recordedAt: Timestamp.fromDate(values.recordedAt.toDate()),
        createdBy: user.id,
        status: user.role === 'dis_kaynak_personeli' ? 'onaylandi' : 'beklemede'
      };

      // Kilometre kaydını ekle
      await MileageService.add(mileageInput);

      // Eğer dış kaynak personeli ise veya kayıt onaylandıysa aracın kilometre bilgisini güncelle
      if (user.role === 'dis_kaynak_personeli' || mileageInput.status === 'onaylandi') {
        await VehicleService.update(values.vehicleId, {
          currentMileage: values.mileage
        });
      }

      message.success('Kilometre kaydı başarıyla eklendi');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Kilometre kaydı eklenirken hata:', error);
      message.error('Kilometre kaydı eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Yeni Kilometre Kaydı"
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okButtonProps={{
        className: "bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
      }}
      cancelButtonProps={{
        className: "hover:border-blue-600 hover:text-blue-600"
      }}
      okText="Kaydet"
      cancelText="İptal"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="vehicleId"
          label="Araç"
          rules={[{ required: true, message: 'Lütfen araç seçin' }]}
        >
          <Select 
            placeholder="Araç seçin"
            onChange={handleVehicleChange}
          >
            {vehicles.map(vehicle => (
              <Select.Option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.brand} {vehicle.model}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="recordedAt"
          label="Kayıt Tarihi"
          rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
          initialValue={dayjs().startOf('month')}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            placeholder="Tarih seçin"
            format="DD/MM/YYYY"
          />
        </Form.Item>

        <Form.Item
          name="mileage"
          label={`Kilometre ${lastMileage ? `(Son kayıt: ${lastMileage.toLocaleString()} km)` : ''}`}
          rules={[{ required: true, message: 'Lütfen kilometre değerini girin' }]}
        >
          <InputNumber<number>
            min={0}
            style={{ width: '100%' }}
            placeholder="Kilometre değerini girin"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value ? Number(value.replace(/,/g, '')) || 0 : 0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMileageModal; 