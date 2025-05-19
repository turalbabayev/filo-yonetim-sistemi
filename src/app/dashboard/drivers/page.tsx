'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserService } from '../../../lib/firebase/services';
import { User } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Table, Button } from 'antd';

export default function DriversPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      const data = await UserService.getByRole('surucu');
      setDrivers(data);
    } catch (error) {
      console.error('Sürücüler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const columns = [
    {
      title: 'Ad Soyad',
      key: 'fullName',
      render: (record: User) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: User) => (
        <Button type="link" onClick={() => router.push(`/dashboard/drivers/${record.id}`)}>
          Detay
        </Button>
      ),
    },
  ];

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Sürücüler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Sistemde kayıtlı tüm sürücülerin listesi
          </p>
        </div>
      </div>

      <Card>
        <Table
          dataSource={drivers}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
} 