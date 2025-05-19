'use client';

import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Button, Table, Spin, Empty } from 'antd';
import { MileageService, VehicleService } from '@/lib/firebase/services';
import { Vehicle, MileageRecord } from '@/types';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';

const { RangePicker } = DatePicker;

interface MileageData {
  date: string;
  mileage: number;
  monthlyKm: number;
  vehicleId: string;
  vehiclePlate: string;
}

export default function MileageReport() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [mileageData, setMileageData] = useState<MileageData[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await VehicleService.getAll();
        setVehicles(data);
      } catch (error) {
        console.error('Araçlar yüklenirken hata:', error);
      }
    };
    fetchVehicles();
  }, []);

  const fetchMileageData = async () => {
    setLoading(true);
    try {
      const mileageRecords = await MileageService.getAll();

      // Tarihe göre filtrele
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();

      const filteredRecords = mileageRecords
        .filter(m => {
          const date = m.recordedAt.toDate();
          return date >= startDate && 
                 date <= endDate && 
                 (selectedVehicle === 'all' || m.vehicleId === selectedVehicle) &&
                 m.status === 'onaylandi';
        })
        .sort((a, b) => b.recordedAt.toDate().getTime() - a.recordedAt.toDate().getTime());

      // Araç bazında grupla ve aylık kilometre hesapla
      const vehicleGroups = new Map<string, MileageRecord[]>();
      filteredRecords.forEach(record => {
        const records = vehicleGroups.get(record.vehicleId) || [];
        records.push(record);
        vehicleGroups.set(record.vehicleId, records);
      });

      const processedData: MileageData[] = [];
      vehicleGroups.forEach((records, vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const nextRecord = records[i + 1];
          const monthlyKm = nextRecord ? record.mileage - nextRecord.mileage : 0;

          processedData.push({
            date: dayjs(record.recordedAt.toDate()).format('YYYY-MM-DD'),
            mileage: record.mileage,
            monthlyKm,
            vehicleId,
            vehiclePlate: vehicle.plate
          });
        }
      });

      setMileageData(processedData);
    } catch (error) {
      console.error('Kilometre verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Araç',
      dataIndex: 'vehiclePlate',
      key: 'vehiclePlate'
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Kilometre',
      dataIndex: 'mileage',
      key: 'mileage',
      render: (mileage: number) => mileage.toLocaleString('tr-TR')
    },
    {
      title: 'Aylık Km',
      dataIndex: 'monthlyKm',
      key: 'monthlyKm',
      render: (km: number) => km.toLocaleString('tr-TR')
    }
  ];

  const chartConfig = {
    data: mileageData,
    xField: 'date',
    yField: 'monthlyKm',
    seriesField: 'vehiclePlate',
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
              Araç
            </label>
            <Select
              value={selectedVehicle}
              onChange={setSelectedVehicle}
              className="w-48"
            >
              <Select.Option value="all">Tüm Araçlar</Select.Option>
              {vehicles.map(vehicle => (
                <Select.Option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Button 
            type="primary" 
            onClick={fetchMileageData}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
          >
            Raporu Getir
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        {mileageData.length > 0 ? (
          <>
            <Card title="Aylık Kilometre Grafiği">
              <Line {...chartConfig} />
            </Card>

            <Card title="Kilometre Detayları">
              <Table
                dataSource={mileageData}
                columns={columns}
                rowKey="date"
                pagination={false}
                scroll={{ x: true }}
                summary={pageData => {
                  const totals = pageData.reduce(
                    (acc, curr) => ({
                      monthlyKm: acc.monthlyKm + curr.monthlyKm
                    }),
                    { monthlyKm: 0 }
                  );

                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>Toplam</Table.Summary.Cell>
                      <Table.Summary.Cell index={1} />
                      <Table.Summary.Cell index={2} />
                      <Table.Summary.Cell index={3}>
                        {totals.monthlyKm.toLocaleString('tr-TR')} km
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