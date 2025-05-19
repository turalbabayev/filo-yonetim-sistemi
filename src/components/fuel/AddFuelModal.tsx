'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber, message, Button } from 'antd';
import { FuelService, VehicleService, AssignmentService } from '@/lib/firebase/services';
import { Vehicle, FuelInput } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddFuelModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        let vehiclesData;
        if (currentUser?.role === 'surucu') {
          // Sürücüye atanan aktif görevleri al
          const assignments = await AssignmentService.getByDriver(currentUser.id);
          const activeAssignments = assignments.filter(a => a.status === 'active');
          const vehicleIds = activeAssignments.map(a => a.vehicleId);
          
          // Sadece atanan araçları getir
          const allVehicles = await VehicleService.getAll();
          vehiclesData = allVehicles.filter(v => vehicleIds.includes(v.id));
        } else {
          // Diğer roller için tüm araçları getir
          vehiclesData = await VehicleService.getAll();
        }
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Araçlar yüklenirken hata:', error);
        message.error('Araçlar yüklenirken bir hata oluştu');
      }
    };

    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen, currentUser]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!currentUser) {
        throw new Error('Kullanıcı oturum açmamış');
      }

      // Seçilen tarih için aynı araca ait kayıt var mı kontrol et
      const startOfDay = dayjs(values.date).startOf('day').toDate();
      const endOfDay = dayjs(values.date).endOf('day').toDate();

      const existingRecords = await FuelService.getByVehicleAndDate(
        values.vehicleId,
        startOfDay,
        endOfDay
      );

      if (existingRecords.length > 0) {
        const confirm = window.confirm(
          'Bu araç için aynı güne ait başka yakıt kayıtları mevcut. Yine de eklemek istiyor musunuz?'
        );
        if (!confirm) {
          return;
        }
      }

      const fuelInput: FuelInput = {
        vehicleId: values.vehicleId,
        date: Timestamp.fromDate(values.date.toDate()),
        amount: values.amount,
        cost: values.cost,
        createdBy: currentUser.id
      };

      await FuelService.add(fuelInput);
      message.success('Yakıt kaydı başarıyla eklendi');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Yakıt kaydı eklenirken hata:', error);
      message.error('Yakıt kaydı eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Yeni Yakıt Kaydı"
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
          <Select placeholder="Araç seçin">
            {vehicles.map(vehicle => (
              <Select.Option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.brand} {vehicle.model}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Yakıt Alım Tarihi"
          rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
        >
          <DatePicker 
            showTime 
            style={{ width: '100%' }} 
            placeholder="Tarih ve saat seçin"
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Yakıt Miktarı (Litre)"
          rules={[{ required: true, message: 'Lütfen yakıt miktarını girin' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder="Yakıt miktarını girin"
          />
        </Form.Item>

        <Form.Item
          name="cost"
          label="Toplam Tutar (TL)"
          rules={[{ required: true, message: 'Lütfen tutarı girin' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/₺\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddFuelModal; 