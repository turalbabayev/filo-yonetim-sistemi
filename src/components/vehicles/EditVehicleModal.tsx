'use client';

import React, { useState, useEffect } from 'react';
import { VehicleService } from '../../lib/firebase/services';
import { Vehicle, VehicleType, VehicleStatus } from '../../types';
import { Form, Select } from 'antd';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle: Vehicle;
}

export default function EditVehicleModal({
  isOpen,
  onClose,
  onSuccess,
  vehicle,
}: EditVehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>({
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    type: vehicle.type,
    status: vehicle.status,
    isPoolVehicle: vehicle.isPoolVehicle,
    initialMileage: vehicle.initialMileage,
    currentMileage: vehicle.currentMileage,
  });

  useEffect(() => {
    setFormData({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      status: vehicle.status,
      isPoolVehicle: vehicle.isPoolVehicle,
      initialMileage: vehicle.initialMileage,
      currentMileage: vehicle.currentMileage,
    });
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await VehicleService.update(vehicle.id, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Araç güncellenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Kapat</span>
              ✕
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Araç Düzenle
              </h3>
              <div className="mt-2">
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <Form.Item
                    name="status"
                    label="Durum"
                    rules={[{ required: true, message: 'Lütfen araç durumunu seçin' }]}
                  >
                    <Select>
                      <Select.Option value="active">Aktif</Select.Option>
                      <Select.Option value="inactive">Pasif</Select.Option>
                      <Select.Option value="maintenance">Bakımda</Select.Option>
                      <Select.Option value="in_use">Kullanımda</Select.Option>
                    </Select>
                  </Form.Item>

                  <div>
                    <label
                      htmlFor="currentMileage"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Güncel Kilometre
                    </label>
                    <input
                      type="number"
                      name="currentMileage"
                      id="currentMileage"
                      required
                      min={formData.initialMileage}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.currentMileage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentMileage: parseInt(e.target.value),
                        })
                      }
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

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={onClose}
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 