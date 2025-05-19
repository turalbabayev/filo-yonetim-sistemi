'use client';

import React, { useState } from 'react';
import { VehicleService } from '../../lib/firebase/services';
import { VehicleType, VehicleStatus, VehicleInput } from '../../types';
import { Modal } from 'antd';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVehicleModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleInput>({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'kiralik',
    status: 'active',
    isPoolVehicle: false,
    initialMileage: 0,
    currentMileage: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await VehicleService.add(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Araç eklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Yeni Araç"
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
      <div className="space-y-4">
        <div>
          <label
            htmlFor="plate"
            className="block text-sm font-medium text-gray-700"
          >
            Plaka
          </label>
          <input
            type="text"
            name="plate"
            id="plate"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.plate}
            onChange={(e) =>
              setFormData({ ...formData, plate: e.target.value })
            }
          />
        </div>

        <div>
          <label
            htmlFor="brand"
            className="block text-sm font-medium text-gray-700"
          >
            Marka
          </label>
          <input
            type="text"
            name="brand"
            id="brand"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
          />
        </div>

        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700"
          >
            Model
          </label>
          <input
            type="text"
            name="model"
            id="model"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
          />
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            Yıl
          </label>
          <input
            type="number"
            name="year"
            id="year"
            required
            min="1900"
            max={new Date().getFullYear()}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.year}
            onChange={(e) =>
              setFormData({
                ...formData,
                year: parseInt(e.target.value),
              })
            }
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Tür
          </label>
          <select
            id="type"
            name="type"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as VehicleType,
              })
            }
          >
            <option value="kiralik">Kiralık</option>
            <option value="ozmal">Özmal</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Durum
          </label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as VehicleStatus,
              })
            }
          >
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="maintenance">Bakımda</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="initialMileage"
            className="block text-sm font-medium text-gray-700"
          >
            Başlangıç Kilometresi
          </label>
          <input
            type="number"
            name="initialMileage"
            id="initialMileage"
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.initialMileage}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setFormData({
                ...formData,
                initialMileage: value,
                currentMileage: value,
              });
            }}
          />
        </div>

        <div className="flex items-center">
          <input
            id="isPoolVehicle"
            name="isPoolVehicle"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={formData.isPoolVehicle}
            onChange={(e) =>
              setFormData({
                ...formData,
                isPoolVehicle: e.target.checked,
              })
            }
          />
          <label
            htmlFor="isPoolVehicle"
            className="ml-2 block text-sm text-gray-900"
          >
            Havuz Aracı
          </label>
        </div>
      </div>
    </Modal>
  );
} 