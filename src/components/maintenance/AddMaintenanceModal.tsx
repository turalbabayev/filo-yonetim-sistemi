'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import { MaintenanceService, VehicleService } from '@/lib/firebase/services';
import { Vehicle, MaintenanceInput } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMaintenanceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      VehicleService.getAll().then(data => {
        setVehicles(data.filter(v => v.status === 'active'));
      });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!user) {
        throw new Error('Kullanıcı oturum açmamış');
      }

      const maintenanceInput: MaintenanceInput = {
        vehicleId: values.vehicleId,
        description: values.description,
        date: Timestamp.fromDate(values.date.toDate()),
        type: values.type,
        cost: values.cost,
        createdBy: user.id
      };

      await MaintenanceService.add(maintenanceInput);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Bakım kaydı eklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Yeni Bakım Kaydı"
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
          name="type"
          label="Bakım Türü"
          rules={[{ required: true, message: 'Lütfen bakım türü seçin' }]}
        >
          <Select placeholder="Bakım türü seçin">
            <Select.Option value="periyodik">Periyodik Bakım</Select.Option>
            <Select.Option value="onarim">Onarım</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Tarih"
          rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
          rules={[{ required: true, message: 'Lütfen açıklama girin' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="cost"
          label="Maliyet (TL)"
          rules={[{ required: true, message: 'Lütfen maliyet girin' }]}
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

export default AddMaintenanceModal; 