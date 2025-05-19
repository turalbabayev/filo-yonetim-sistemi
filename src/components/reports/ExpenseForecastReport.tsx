'use client';

import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Table, Spin, Empty } from 'antd';
import { 
  MaintenanceService, 
  TireChangeService, 
  PartChangeService, 
  VehicleService 
} from '@/lib/firebase/services';
import { Vehicle } from '@/types';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';

interface MonthlyExpense {
  month: string;
  maintenance: number;
  tire: number;
  part: number;
  total: number;
}

interface ForecastData extends MonthlyExpense {
  isEstimate: boolean;
}

export default function ExpenseForecastReport() {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await VehicleService.getAll();
        setVehicles(data);
        // Araçlar yüklendikten sonra otomatik olarak raporu getir
        fetchForecastData();
      } catch (error) {
        console.error('Araçlar yüklenirken hata:', error);
      }
    };
    fetchVehicles();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const calculateMovingAverage = (data: MonthlyExpense[], months: number = 3) => {
    const result: ForecastData[] = [...data.map(d => ({ ...d, isEstimate: false }))];
    
    if (data.length < months) {
      return result;
    }

    // Gelecek 3 ay için tahmin yap
    const lastMonths = data.slice(-months);
    const nextThreeMonths = Array.from({ length: 3 }, (_, i) => {
      const average: MonthlyExpense = {
        month: dayjs().add(i + 1, 'month').format('YYYY-MM'),
        maintenance: Math.round(lastMonths.reduce((sum, curr) => sum + curr.maintenance, 0) / months),
        tire: Math.round(lastMonths.reduce((sum, curr) => sum + curr.tire, 0) / months),
        part: Math.round(lastMonths.reduce((sum, curr) => sum + curr.part, 0) / months),
        total: 0
      };
      average.total = average.maintenance + average.tire + average.part;
      return { ...average, isEstimate: true };
    });

    return [...result, ...nextThreeMonths];
  };

  const fetchForecastData = async () => {
    setLoading(true);
    try {
      const [maintenances, tireChanges, partChanges] = await Promise.all([
        MaintenanceService.getAll(),
        TireChangeService.getAll(),
        PartChangeService.getAll()
      ]);

      // Son 12 ayın verilerini al
      const startDate = dayjs().subtract(11, 'months').startOf('month').toDate();
      const endDate = dayjs().endOf('month').toDate();

      // Aylık harcamaları hesapla
      const monthlyExpenses = new Map<string, MonthlyExpense>();

      // Bakım harcamaları
      maintenances.forEach(m => {
        const date = m.date.toDate();
        if (date < startDate || date > endDate) return;
        if (selectedVehicle !== 'all' && m.vehicleId !== selectedVehicle) return;

        const monthStr = dayjs(date).format('YYYY-MM');
        const existing = monthlyExpenses.get(monthStr) || {
          month: monthStr,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };

        existing.maintenance += m.cost;
        existing.total += m.cost;
        monthlyExpenses.set(monthStr, existing);
      });

      // Lastik harcamaları
      tireChanges.forEach(t => {
        const date = t.date.toDate();
        if (date < startDate || date > endDate) return;
        if (selectedVehicle !== 'all' && t.vehicleId !== selectedVehicle) return;

        const monthStr = dayjs(date).format('YYYY-MM');
        const existing = monthlyExpenses.get(monthStr) || {
          month: monthStr,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };

        existing.tire += t.cost;
        existing.total += t.cost;
        monthlyExpenses.set(monthStr, existing);
      });

      // Parça harcamaları
      partChanges.forEach(p => {
        const date = p.date.toDate();
        if (date < startDate || date > endDate) return;
        if (selectedVehicle !== 'all' && p.vehicleId !== selectedVehicle) return;

        const monthStr = dayjs(date).format('YYYY-MM');
        const existing = monthlyExpenses.get(monthStr) || {
          month: monthStr,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };

        existing.part += p.cost;
        existing.total += p.cost;
        monthlyExpenses.set(monthStr, existing);
      });

      // Tarihe göre sırala
      const sortedData = Array.from(monthlyExpenses.values())
        .sort((a, b) => a.month.localeCompare(b.month));

      // Hareketli ortalama ile tahmin yap
      const forecastedData = calculateMovingAverage(sortedData);
      setForecastData(forecastedData);
    } catch (error) {
      console.error('Harcama verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Ay',
      dataIndex: 'month',
      key: 'month',
      render: (month: string, record: ForecastData) => (
        <div className="flex items-center gap-2">
          <span>{dayjs(month).format('MMMM YYYY')}</span>
          {record.isEstimate && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
              Tahmin
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Bakım',
      dataIndex: 'maintenance',
      key: 'maintenance',
      render: (amount: number, record: ForecastData) => (
        <span className={record.isEstimate ? 'text-blue-600 font-semibold' : ''}>
          {amount.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          })}
          {record.isEstimate && ' *'}
        </span>
      )
    },
    {
      title: 'Lastik',
      dataIndex: 'tire',
      key: 'tire',
      render: (amount: number, record: ForecastData) => (
        <span className={record.isEstimate ? 'text-blue-600 font-semibold' : ''}>
          {amount.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          })}
          {record.isEstimate && ' *'}
        </span>
      )
    },
    {
      title: 'Parça',
      dataIndex: 'part',
      key: 'part',
      render: (amount: number, record: ForecastData) => (
        <span className={record.isEstimate ? 'text-blue-600 font-semibold' : ''}>
          {amount.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          })}
          {record.isEstimate && ' *'}
        </span>
      )
    },
    {
      title: 'Toplam',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number, record: ForecastData) => (
        <span className={record.isEstimate ? 'text-blue-600 font-semibold' : ''}>
          {amount.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          })}
          {record.isEstimate && ' *'}
        </span>
      )
    }
  ];

  const chartConfig = {
    data: forecastData,
    xField: 'month',
    yField: 'total',
    seriesField: 'isEstimate',
    xAxis: {
      type: 'time',
      label: {
        formatter: (v: string) => dayjs(v).format('MM/YYYY')
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `₺${Number(v).toLocaleString('tr-TR')}`
      }
    },
    color: ['#1890ff', '#52c41a'],
    legend: {
      itemName: {
        formatter: (text: string) => text === 'true' ? 'Tahmin' : 'Gerçekleşen'
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-600">
            Bu rapor, son 12 ayın verilerini kullanarak gelecek 3 ay için harcama tahmini yapar.
            Tahmin, son 3 ayın ortalama harcamalarına dayanır.
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Araç
              </label>
              <Select
                value={selectedVehicle}
                onChange={(value) => {
                  setSelectedVehicle(value);
                  setTimeout(() => fetchForecastData(), 100);
                }}
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
              onClick={fetchForecastData}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
            >
              Raporu Güncelle
            </Button>
          </div>
        </div>
      </Card>

      <Spin spinning={loading}>
        {forecastData.length > 0 ? (
          <>
            <Card title="Harcama Tahmini Grafiği">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Nasıl Çalışır?</h3>
                  <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    <li>Mavi renkli ve * işaretli değerler tahmin edilen tutarları gösterir</li>
                    <li>Tahminler son 3 ayın ortalaması alınarak hesaplanır</li>
                    <li>Gelecek 3 ay için tahmin yapılır</li>
                  </ul>
                </div>
                <Line {...chartConfig} />
              </div>
            </Card>

            <Card 
              title="Harcama Detayları ve Tahmin"
              extra={
                <div className="text-sm text-gray-500">
                  * Tahmin edilen değerleri gösterir
                </div>
              }
            >
              <Table
                dataSource={forecastData}
                columns={columns}
                rowKey="month"
                pagination={false}
                scroll={{ x: true }}
                rowClassName={(record) => record.isEstimate ? 'bg-blue-50' : ''}
              />
            </Card>
          </>
        ) : (
          <Card>
            <Empty description="Tahmin için yeterli veri bulunamadı" />
          </Card>
        )}
      </Spin>
    </div>
  );
} 