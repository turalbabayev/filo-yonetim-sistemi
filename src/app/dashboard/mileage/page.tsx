'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, message } from 'antd';
import { MileageService, VehicleService } from '@/lib/firebase/services';
import { MileageRecord, Vehicle } from '@/types';
import AddMileageModal from '@/components/mileage/AddMileageModal';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';

const MileagePage = () => {
  const [mileageRecords, setMileageRecords] = useState<MileageRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mileageData, vehiclesData] = await Promise.all([
          MileageService.getAll(),
          VehicleService.getAll()
        ]);
        setMileageRecords(mileageData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (record: MileageRecord, newStatus: 'onaylandi' | 'reddedildi') => {
    try {
      await MileageService.update(record.id, { status: newStatus });

      // Eğer onaylandıysa aracın kilometre bilgisini güncelle
      if (newStatus === 'onaylandi') {
        await VehicleService.update(record.vehicleId, {
          currentMileage: record.mileage
        });
      }

      // Kayıtları yenile
      const updatedRecords = await MileageService.getAll();
      setMileageRecords(updatedRecords);

      message.success(`Kayıt ${newStatus === 'onaylandi' ? 'onaylandı' : 'reddedildi'}`);
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      message.error('Durum güncellenirken bir hata oluştu');
    }
  };

  const columns = [
    {
      title: 'Araç',
      key: 'vehicle',
      render: (record: MileageRecord) => {
        const vehicle = vehicles.find(v => v.id === record.vehicleId);
        return vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Yükleniyor...';
      }
    },
    {
      title: 'Tarih',
      dataIndex: 'recordedAt',
      key: 'recordedAt',
      render: (date: any) => dayjs(date.toDate()).format('DD/MM/YYYY'),
    },
    {
      title: 'Kilometre',
      dataIndex: 'mileage',
      key: 'mileage',
      render: (mileage: number) => mileage.toLocaleString(),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: MileageRecord) => {
        let color = 'default';
        let text = 'Bilinmiyor';

        switch (status) {
          case 'beklemede':
            color = 'warning';
            text = 'Onay Bekliyor';
            break;
          case 'onaylandi':
            color = 'success';
            text = 'Onaylandı';
            break;
          case 'reddedildi':
            color = 'error';
            text = 'Reddedildi';
            break;
        }

        // Dış kaynak personeli için onay/red butonları
        if (user?.role === 'dis_kaynak_personeli' && status === 'beklemede') {
          return (
            <Space>
              <Tag color={color}>{text}</Tag>
              <Button 
                type="link" 
                size="small" 
                onClick={() => handleStatusChange(record, 'onaylandi')}
              >
                Onayla
              </Button>
              <Button 
                type="link" 
                size="small" 
                danger 
                onClick={() => handleStatusChange(record, 'reddedildi')}
              >
                Reddet
              </Button>
            </Space>
          );
        }

        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Aylık Km',
      key: 'monthlyKm',
      render: (record: MileageRecord, _record: any, index: number) => {
        if (index === mileageRecords.length - 1) return '-';
        const nextRecord = mileageRecords[index + 1];
        const diff = record.mileage - nextRecord.mileage;
        return diff.toLocaleString();
      }
    }
  ];

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  const canAddMileage = user?.role === 'dis_kaynak_personeli' || user?.role === 'surucu';

  return (
    <div className="p-6">
      <Card 
        title="Kilometre Kayıtları"
        extra={
          canAddMileage && (
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Yeni Kilometre Kaydı
            </Button>
          )
        }
      >
        <Table 
          dataSource={mileageRecords} 
          columns={columns} 
          rowKey="id"
        />
      </Card>

      <AddMileageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          MileageService.getAll().then(setMileageRecords);
        }}
      />
    </div>
  );
};

export default MileagePage; 