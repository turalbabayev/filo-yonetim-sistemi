'use client';

import React, { useEffect, useState } from 'react';
import { VehicleService, MaintenanceService, FuelService, AssignmentService } from '@/lib/firebase/services';
import { Vehicle, Maintenance, FuelRecord, Assignment } from '@/types';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Table, Tag } from 'antd';
import dayjs from 'dayjs';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'surucu') {
          // Sürücüye atanan görevleri al
          const assignmentsData = await AssignmentService.getByDriver(user.id);
          setAssignments(assignmentsData);

          // Sürücüye atanan araçların ID'lerini al
          const assignedVehicleIds = Array.from(new Set(assignmentsData.map(a => a.vehicleId)));
          
          // Atanan araçların detaylarını al
          const vehiclesData = await Promise.all(
            assignedVehicleIds.map(id => VehicleService.get(id))
          );
          setVehicles(vehiclesData.filter((v): v is Vehicle => v !== null));

        } else {
          const [vehiclesData, maintenanceData, fuelData] = await Promise.all([
            VehicleService.getAll(),
            MaintenanceService.getAll(),
            FuelService.getAll(),
          ]);
          setVehicles(vehiclesData);
          setMaintenanceRecords(maintenanceData);
          setFuelRecords(fuelData);
        }
      } catch (error) {
        console.error('Dashboard verisi yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'firma_yetkilisi':
        return 'Firma Yetkilisi';
      case 'dis_kaynak_personeli':
        return 'Dış Kaynak Personeli';
      case 'surucu':
        return 'Sürücü';
      default:
        return role;
    }
  };

  const assignmentColumns = [
    {
      title: 'Araç',
      key: 'vehicle',
      render: (record: Assignment) => {
        const vehicle = vehicles.find(v => v.id === record.vehicleId);
        return vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Yükleniyor...';
      }
    },
    {
      title: 'Görev',
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Hoş geldiniz, {user ? `${user.firstName} ${user.lastName}` : 'Yükleniyor...'} ({getRoleDisplay(user?.role || '')})</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Çıkış Yap
        </button>
      </div>
      
      {/* İstatistikler */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">🚗</div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {user?.role === 'surucu' ? 'Atanan Araçlar' : 'Toplam Araç'}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {vehicles.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {user?.role === 'surucu' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">📋</div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Aktif Görevler
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {assignments.filter(a => a.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {(user?.role === 'firma_yetkilisi' || user?.role === 'dis_kaynak_personeli') && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">🔧</div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Bakım Kayıtları
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {maintenanceRecords.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">⛽</div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Yakıt Kayıtları
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {fuelRecords.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">💰</div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Toplam Yakıt Maliyeti
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {fuelRecords.reduce((acc, record) => acc + record.cost, 0).toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sürücü Görevleri */}
      {user?.role === 'surucu' && (
        <Card title="Görevlerim">
          <Table
            dataSource={assignments}
            columns={assignmentColumns}
            rowKey="id"
          />
        </Card>
      )}

      {/* Son Bakımlar - Sadece firma yetkilisi ve dış kaynak personeli görebilir */}
      {(user?.role === 'firma_yetkilisi' || user?.role === 'dis_kaynak_personeli') && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Son Bakımlar</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {maintenanceRecords.slice(0, 5).map((record) => (
                    <li key={record.id} className="py-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {vehicles.find((v) => v.id === record.vehicleId)?.plate || 'Bilinmeyen Araç'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{record.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {record.cost.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sürücü için özel bölüm */}
      {user?.role === 'surucu' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Atanan Araçlarım</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <li key={vehicle.id} className="py-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {vehicle.plate} - {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-sm text-gray-500">
                            Son Kilometre: {vehicle.currentMileage} km
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 
                            vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status === 'active' ? 'Aktif' : 
                             vehicle.status === 'maintenance' ? 'Bakımda' : 
                             'Pasif'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 