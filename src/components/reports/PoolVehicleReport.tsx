'use client';

import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Button, Table, Spin, Empty } from 'antd';
import { AssignmentService, VehicleService, UserService } from '@/lib/firebase/services';
import { Vehicle, Assignment, User } from '@/types';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';

const { RangePicker } = DatePicker;

interface PoolUsageData {
  date: string;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  duration: number;
  kilometers: number;
  description?: string;
}

export default function PoolVehicleReport() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [usageData, setUsageData] = useState<PoolUsageData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, usersData] = await Promise.all([
          VehicleService.getAll(),
          UserService.getAll()
        ]);
        // Sadece havuz araçlarını filtrele
        setVehicles(vehiclesData.filter(v => v.isPoolVehicle));
        setDrivers(usersData.filter(user => user.role === 'surucu'));
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
      }
    };
    fetchData();
  }, []);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      const assignments = await AssignmentService.getAll();

      // Tarihe göre filtrele
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();

      const filteredAssignments = assignments.filter(a => {
        const startTime = a.startTime.toDate();
        const vehicle = vehicles.find(v => v.id === a.vehicleId);
        return startTime >= startDate && 
               startTime <= endDate && 
               vehicle?.isPoolVehicle &&
               (selectedVehicle === 'all' || a.vehicleId === selectedVehicle);
      });

      // Kullanım verilerini hesapla
      const processedData: PoolUsageData[] = filteredAssignments.map(assignment => {
        const vehicle = vehicles.find(v => v.id === assignment.vehicleId);
        const driver = drivers.find(d => d.id === assignment.driverId);
        const startTime = assignment.startTime.toDate();
        const endTime = assignment.endTime?.toDate() || new Date();
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Saat cinsinden

        return {
          date: dayjs(startTime).format('YYYY-MM-DD'),
          vehicleId: assignment.vehicleId,
          vehiclePlate: vehicle ? vehicle.plate : 'Bilinmiyor',
          driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Bilinmiyor',
          duration: Number(duration.toFixed(2)),
          kilometers: assignment.kilometers || 0,
          description: assignment.description
        };
      });

      setUsageData(processedData);
    } catch (error) {
      console.error('Kullanım verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Araç',
      dataIndex: 'vehiclePlate',
      key: 'vehiclePlate'
    },
    {
      title: 'Sürücü',
      dataIndex: 'driverName',
      key: 'driverName'
    },
    {
      title: 'Süre (Saat)',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => duration.toLocaleString('tr-TR')
    },
    {
      title: 'Mesafe (Km)',
      dataIndex: 'kilometers',
      key: 'kilometers',
      render: (km: number) => km.toLocaleString('tr-TR')
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description'
    }
  ];

  const chartConfig = {
    data: usageData,
    xField: 'date',
    yField: 'duration',
    seriesField: 'vehiclePlate',
    xAxis: {
      type: 'time',
      label: {
        formatter: (v: string) => dayjs(v).format('DD/MM/YYYY')
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${Number(v).toLocaleString('tr-TR')} saat`
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarih Aralığı
            </label>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Havuz Aracı
            </label>
            <Select
              value={selectedVehicle}
              onChange={setSelectedVehicle}
              className="w-48"
            >
              <Select.Option value="all">Tüm Havuz Araçları</Select.Option>
              {vehicles.map(vehicle => (
                <Select.Option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Button 
            type="primary" 
            onClick={fetchUsageData}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
          >
            Raporu Getir
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        {usageData.length > 0 ? (
          <>
            <Card title="Havuz Araçları Kullanım Grafiği">
              <Line {...chartConfig} />
            </Card>

            <Card title="Kullanım Detayları">
              <Table
                dataSource={usageData}
                columns={columns}
                rowKey={(record) => `${record.date}-${record.vehicleId}`}
                pagination={false}
                scroll={{ x: true }}
                summary={pageData => {
                  const totals = pageData.reduce(
                    (acc, curr) => ({
                      duration: acc.duration + curr.duration,
                      kilometers: acc.kilometers + curr.kilometers
                    }),
                    { duration: 0, kilometers: 0 }
                  );

                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>Toplam</Table.Summary.Cell>
                      <Table.Summary.Cell index={1} />
                      <Table.Summary.Cell index={2} />
                      <Table.Summary.Cell index={3}>
                        {totals.duration.toLocaleString('tr-TR')}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {totals.kilometers.toLocaleString('tr-TR')}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} />
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>
          </>
        ) : (
          <Card>
            <Empty description="Seçilen kriterlere uygun veri bulunamadı" />
          </Card>
        )}
      </Spin>
    </div>
  );
} 