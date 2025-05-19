'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Button } from 'antd';
import { FuelService, VehicleService, UserService } from '@/lib/firebase/services';
import { FuelRecord, Vehicle, User } from '@/types';
import AddFuelModal from '@/components/fuel/AddFuelModal';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';

const FuelPage = () => {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fuelData, vehiclesData, usersData] = await Promise.all([
          FuelService.getAll(),
          VehicleService.getAll(),
          UserService.getAll()
        ]);
        setFuelRecords(fuelData);
        setVehicles(vehiclesData);
        setUsers(usersData);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: 'Araç',
      key: 'vehicle',
      render: (record: FuelRecord) => {
        const vehicle = vehicles.find(v => v.id === record.vehicleId);
        return vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Yükleniyor...';
      }
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date: any) => dayjs(date.toDate()).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Miktar (Litre)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => amount.toFixed(2),
    },
    {
      title: 'Tutar (TL)',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => cost.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }),
    },
    {
      title: 'Litre Fiyatı',
      key: 'pricePerLiter',
      render: (record: FuelRecord) => (record.cost / record.amount).toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }),
    },
    {
      title: 'Kaydı Giren',
      key: 'createdBy',
      render: (record: FuelRecord) => {
        const creator = users.find(u => u.id === record.createdBy);
        if (!creator) return 'Bilinmiyor';
        
        let roleText = '';
        switch (creator.role) {
          case 'surucu':
            roleText = '(Sürücü)';
            break;
          case 'dis_kaynak_personeli':
            roleText = '(Dış Kaynak)';
            break;
          case 'firma_yetkilisi':
            roleText = '(Firma Yetkilisi)';
            break;
        }
        
        return `${creator.firstName} ${creator.lastName} ${roleText}`;
      },
    }
  ];

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  const canAddFuel = user?.role === 'dis_kaynak_personeli' || user?.role === 'surucu';

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Yakıt Kayıtları</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm araçların yakıt kayıtları ve detayları
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
          >
            Yeni Yakıt Kaydı
          </Button>
        </div>
      </div>

      <Card>
        <Table 
          dataSource={fuelRecords} 
          columns={columns} 
          rowKey="id"
        />
      </Card>

      <AddFuelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          FuelService.getAll().then(setFuelRecords);
        }}
      />
    </div>
  );
};

export default FuelPage; 