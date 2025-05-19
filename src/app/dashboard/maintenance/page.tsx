'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Tabs } from 'antd';
import { MaintenanceService, TireChangeService, PartChangeService, VehicleService } from '@/lib/firebase/services';
import { Maintenance, TireChange, PartChange, Vehicle } from '@/types';
import AddMaintenanceModal from '@/components/maintenance/AddMaintenanceModal';
import { AddTireChangeModal } from '@/components/tire/AddTireChangeModal';
import { AddPartChangeModal } from '@/components/part/AddPartChangeModal';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';

const MaintenancePage = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [tireChanges, setTireChanges] = useState<TireChange[]>([]);
  const [partChanges, setPartChanges] = useState<PartChange[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isTireModalOpen, setIsTireModalOpen] = useState(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [maintenanceData, tireData, partData, vehiclesData] = await Promise.all([
          MaintenanceService.getAll(),
          TireChangeService.getAll(),
          PartChangeService.getAll(),
          VehicleService.getAll()
        ]);
        setMaintenances(maintenanceData);
        setTireChanges(tireData);
        setPartChanges(partData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const maintenanceColumns = [
    {
      title: 'Araç',
      key: 'vehicle',
      render: (record: Maintenance) => {
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
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Maliyet',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => cost.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }),
    }
  ];

  const tireColumns = [
    {
      title: 'Araç',
      key: 'vehicle',
      render: (record: TireChange) => {
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
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Maliyet',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => cost.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }),
    }
  ];

  const partColumns = [
    {
      title: 'Araç',
      key: 'vehicle',
      render: (record: PartChange) => {
        const vehicle = vehicles.find(v => v.id === record.vehicleId);
        return vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Yükleniyor...';
      }
    },
    {
      title: 'Parça',
      dataIndex: 'partName',
      key: 'partName',
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date: any) => dayjs(date.toDate()).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ödeme Türü',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (type: string) => (
        <Tag color={type === 'kasko' ? 'blue' : 'green'}>
          {type === 'kasko' ? 'Kasko' : 'Ücretli'}
        </Tag>
      ),
    },
    {
      title: 'Maliyet',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => cost.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }),
    }
  ];

  const items = [
    {
      key: '1',
      label: 'Genel Bakımlar',
      children: (
        <Table 
          dataSource={maintenances} 
          columns={maintenanceColumns} 
          rowKey="id"
        />
      ),
    },
    {
      key: '2',
      label: 'Lastik Değişimleri',
      children: (
        <Table 
          dataSource={tireChanges} 
          columns={tireColumns} 
          rowKey="id"
        />
      ),
    },
    {
      key: '3',
      label: 'Parça Değişimleri',
      children: (
        <Table 
          dataSource={partChanges} 
          columns={partColumns} 
          rowKey="id"
        />
      ),
    },
  ];

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Bakım ve Değişim Kayıtları</h1>
        <p className="mt-2 text-sm text-gray-700">
          Araçların bakım, lastik ve parça değişim kayıtları
        </p>
      </div>

      <div className="mb-4 flex gap-4">
        {user?.role === 'firma_yetkilisi' && (
          <>
            <Button 
              type="primary" 
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
            >
              Bakım Ekle
            </Button>
            <Button 
              type="primary" 
              onClick={() => setIsTireModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
            >
              Lastik Değişimi Ekle
            </Button>
            <Button 
              type="primary" 
              onClick={() => setIsPartModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
            >
              Parça Değişimi Ekle
            </Button>
          </>
        )}
      </div>

      <Card>
        <Tabs items={items} />
      </Card>

      <AddMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSuccess={() => {
          MaintenanceService.getAll().then(setMaintenances);
        }}
      />

      <AddTireChangeModal
        isOpen={isTireModalOpen}
        onClose={() => setIsTireModalOpen(false)}
        onSuccess={() => {
          TireChangeService.getAll().then(setTireChanges);
        }}
      />

      <AddPartChangeModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSuccess={() => {
          PartChangeService.getAll().then(setPartChanges);
        }}
      />
    </div>
  );
};

export default MaintenancePage; 