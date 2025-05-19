'use client';

import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Button, Table, Spin, Empty } from 'antd';
import { AssignmentService, VehicleService, UserService } from '@/lib/firebase/services';
import { Vehicle, Assignment, User } from '@/types';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';

const { RangePicker } = DatePicker;

interface UsageData {
  date: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  duration: number; // Saat cinsinden
  kilometers: number;
}

export default function DriverUsageReport() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [usageData, setUsageData] = useState<UsageData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, usersData] = await Promise.all([
          VehicleService.getAll(),
          UserService.getAll()
        ]);
        setVehicles(vehiclesData);
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
        return startTime >= startDate && 
               startTime <= endDate && 
               (selectedDriver === 'all' || a.driverId === selectedDriver);
      });

      // Kullanım verilerini hesapla
      const processedData: UsageData[] = filteredAssignments.map(assignment => {
        const vehicle = vehicles.find(v => v.id === assignment.vehicleId);
        const driver = drivers.find(d => d.id === assignment.driverId);
        const startTime = assignment.startTime.toDate();
        const endTime = assignment.endTime?.toDate() || new Date();
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Saat cinsinden

        return {
          date: dayjs(startTime).format('YYYY-MM-DD'),
          driverId: assignment.driverId,
          driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Bilinmiyor',
          vehicleId: assignment.vehicleId,
          vehiclePlate: vehicle ? vehicle.plate : 'Bilinmiyor',
          duration: Number(duration.toFixed(2)),
          kilometers: assignment.kilometers || 0
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
      title: 'Sürücü',
      dataIndex: 'driverName',
      key: 'driverName'
    },
    {
      title: 'Araç',
      dataIndex: 'vehiclePlate',
      key: 'vehiclePlate'
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
    }
  ];

  const chartConfig = {
    data: usageData,
    xField: 'date',
    yField: 'kilometers',
    seriesField: 'driverName',
    xAxis: {
      type: 'time',
      label: {
        formatter: (v: string) => dayjs(v).format('DD/MM/YYYY')
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${Number(v).toLocaleString('tr-TR')} km`
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
              Sürücü
            </label>
            <Select
              value={selectedDriver}
              onChange={setSelectedDriver}
              className="w-48"
            >
              <Select.Option value="all">Tüm Sürücüler</Select.Option>
              {drivers.map(driver => (
                <Select.Option key={driver.id} value={driver.id}>
                  {driver.firstName} {driver.lastName}
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
            <Card title="Sürücü Kullanım Grafiği">
              <Line {...chartConfig} />
            </Card>

            <Card title="Kullanım Detayları">
              <Table
                dataSource={usageData}
                columns={columns}
                rowKey={(record) => `${record.date}-${record.driverId}-${record.vehicleId}`}
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