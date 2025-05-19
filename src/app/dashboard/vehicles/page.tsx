'use client';

import React, { useEffect, useState } from 'react';
import { VehicleService } from '../../../lib/firebase/services';
import { Vehicle } from '../../../types';
import AddVehicleModal from '../../../components/vehicles/AddVehicleModal';
import EditVehicleModal from '../../../components/vehicles/EditVehicleModal';
import { useAuth } from '../../../contexts/AuthContext';
import { Tag } from 'antd';

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    try {
      const data = await VehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddSuccess = () => {
    fetchVehicles();
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchVehicles();
    setIsEditModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleDeleteClick = async (vehicle: Vehicle) => {
    if (window.confirm(`${vehicle.plate} plakalı aracı silmek istediğinize emin misiniz?`)) {
      try {
        await VehicleService.delete(vehicle.id);
        fetchVehicles();
      } catch (error) {
        console.error('Araç silinirken hata:', error);
        alert('Araç silinirken bir hata oluştu.');
      }
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Araçlar</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm araçların listesi ve detayları
          </p>
        </div>
        {user?.role !== 'surucu' && user?.role !== 'dis_kaynak_personeli' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Araç Ekle
            </button>
          </div>
        )}
      </div>

      {/* Araç Ekleme Modalı */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Araç Düzenleme Modalı */}
      {selectedVehicle && (
        <EditVehicleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedVehicle(null);
          }}
          onSuccess={handleEditSuccess}
          vehicle={selectedVehicle}
        />
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Plaka
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Marka/Model
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tür
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Durum
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Kilometre
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {vehicle.plate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {vehicle.brand} {vehicle.model}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {vehicle.type === 'kiralik' ? 'Kiralık' : 'Özmal'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Tag color={
                          vehicle.status === 'active' ? 'success' :
                          vehicle.status === 'maintenance' ? 'warning' :
                          vehicle.status === 'inactive' ? 'error' :
                          vehicle.status === 'in_use' ? 'processing' :
                          'default'
                        }>
                          {vehicle.status === 'active' ? 'Aktif' :
                           vehicle.status === 'maintenance' ? 'Bakımda' :
                           vehicle.status === 'inactive' ? 'Pasif' :
                           vehicle.status === 'in_use' ? 'Kullanımda' :
                           'Bilinmiyor'}
                        </Tag>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {vehicle.currentMileage.toLocaleString('tr-TR')} km
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {user?.role !== 'surucu' && user?.role !== 'dis_kaynak_personeli' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditClick(vehicle)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(vehicle)}
                              className="ml-4 text-red-600 hover:text-red-900"
                            >
                              Sil
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 