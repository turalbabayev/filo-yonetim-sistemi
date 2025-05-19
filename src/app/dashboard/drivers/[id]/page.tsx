'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserService, AssignmentService } from '@/lib/firebase/services';
import { User, Assignment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Descriptions, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { AddAssignmentModal } from '@/components/assignment/AddAssignmentModal';

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [driver, setDriver] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('Mevcut kullanıcı:', currentUser);
    const fetchData = async () => {
      try {
        const driverId = params.id as string;
        const [driverData, assignmentsData] = await Promise.all([
          UserService.get(driverId),
          AssignmentService.getByDriver(driverId)
        ]);

        if (driverData) {
          setDriver(driverData);
          console.log('Sürücü bilgileri:', driverData);
        }
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, currentUser]);

  const columns = [
    {
      title: 'Görev Başlığı',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date: any) => dayjs(date.toDate()).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (date: any) => date ? dayjs(date.toDate()).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = 'Bilinmiyor';

        switch (status) {
          case 'active':
            color = 'green';
            text = 'Aktif';
            break;
          case 'completed':
            color = 'blue';
            text = 'Tamamlandı';
            break;
          case 'cancelled':
            color = 'red';
            text = 'İptal Edildi';
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!driver) {
    return <div>Sürücü bulunamadı</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button onClick={() => router.back()}>Geri</Button>
      </div>

      <Card>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : driver ? (
          <Descriptions title="Sürücü Bilgileri" bordered>
            <Descriptions.Item label="Ad Soyad">
              {`${driver.firstName} ${driver.lastName}`}
            </Descriptions.Item>
            <Descriptions.Item label="E-posta">{driver.email}</Descriptions.Item>
            <Descriptions.Item label="Telefon">{driver.phone || '-'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <div>Sürücü bulunamadı</div>
        )}
      </Card>

      <Card 
        title="Görevler" 
        extra={
          currentUser?.role === 'firma_yetkilisi' && (
            <Button 
              type="primary" 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
            >
              Yeni Görev Ekle
            </Button>
          )
        }
      >
        <Table 
          dataSource={assignments} 
          columns={columns} 
          rowKey="id"
        />
      </Card>

      {currentUser?.role === 'firma_yetkilisi' && (
        <AddAssignmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            AssignmentService.getByDriver(params.id as string).then(setAssignments);
          }}
          driverId={params.id as string}
        />
      )}
    </div>
  );
} 