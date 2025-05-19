'use client';

import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Button, Table, Spin, Empty } from 'antd';
import { 
  MaintenanceService, 
  TireChangeService, 
  PartChangeService, 
  VehicleService 
} from '@/lib/firebase/services';
import { Vehicle, Maintenance, TireChange, PartChange } from '@/types';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';

const { RangePicker } = DatePicker;

interface ExpenseData {
  date: string;
  maintenance: number;
  tire: number;
  part: number;
  total: number;
}

export default function ExpenseReport() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);

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

  const fetchExpenseData = async () => {
    setLoading(true);
    try {
      const [maintenances, tireChanges, partChanges] = await Promise.all([
        MaintenanceService.getAll(),
        TireChangeService.getAll(),
        PartChangeService.getAll()
      ]);

      // Tarihe göre filtrele
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();

      const filteredMaintenances = maintenances.filter(m => {
        const date = m.date.toDate();
        return date >= startDate && date <= endDate &&
          (selectedVehicle === 'all' || m.vehicleId === selectedVehicle);
      });

      const filteredTireChanges = tireChanges.filter(t => {
        const date = t.date.toDate();
        return date >= startDate && date <= endDate &&
          (selectedVehicle === 'all' || t.vehicleId === selectedVehicle);
      });

      const filteredPartChanges = partChanges.filter(p => {
        const date = p.date.toDate();
        return date >= startDate && date <= endDate &&
          (selectedVehicle === 'all' || p.vehicleId === selectedVehicle);
      });

      // Günlük harcamaları hesapla
      const expenseMap = new Map<string, ExpenseData>();

      filteredMaintenances.forEach(m => {
        const dateStr = dayjs(m.date.toDate()).format('YYYY-MM-DD');
        const existing = expenseMap.get(dateStr) || {
          date: dateStr,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };
        existing.maintenance += m.cost;
        existing.total += m.cost;
        expenseMap.set(dateStr, existing);
      });

      filteredTireChanges.forEach(t => {
        const dateStr = dayjs(t.date.toDate()).format('YYYY-MM-DD');
        const existing = expenseMap.get(dateStr) || {
          date: dateStr,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };
        existing.tire += t.cost;
        existing.total += t.cost;
        expenseMap.set(dateStr, existing);
      });

      filteredPartChanges.forEach(p => {
        const dateStr = dayjs(p.date.toDate()).format('YYYY-MM-DD');
        const existing = expenseMap.get(dateStr) || {
          date: dateStr,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };
        existing.part += p.cost;
        existing.total += p.cost;
        expenseMap.set(dateStr, existing);
      });

      // Tarihe göre sırala
      const sortedData = Array.from(expenseMap.values()).sort((a, b) => 
        a.date.localeCompare(b.date)
      );

      setExpenseData(sortedData);
    } catch (error) {
      console.error('Harcama verileri yüklenirken hata:', error);
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
      title: 'Bakım',
      dataIndex: 'maintenance',
      key: 'maintenance',
      render: (amount: number) => amount.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      })
    },
    {
      title: 'Lastik',
      dataIndex: 'tire',
      key: 'tire',
      render: (amount: number) => amount.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      })
    },
    {
      title: 'Parça',
      dataIndex: 'part',
      key: 'part',
      render: (amount: number) => amount.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      })
    },
    {
      title: 'Toplam',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number) => amount.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      })
    }
  ];

  const chartConfig = {
    data: expenseData,
    xField: 'date',
    yField: 'total',
    seriesField: 'type',
    xAxis: {
      type: 'time',
      label: {
        formatter: (v: string) => dayjs(v).format('DD/MM/YYYY')
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `₺${Number(v).toLocaleString('tr-TR')}`
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
            onClick={fetchExpenseData}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
          >
            Raporu Getir
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        {expenseData.length > 0 ? (
          <>
            <Card title="Harcama Grafiği">
              <Line {...chartConfig} />
            </Card>

            <Card title="Harcama Detayları">
              <Table
                dataSource={expenseData}
                columns={columns}
                rowKey="date"
                pagination={false}
                scroll={{ x: true }}
                summary={pageData => {
                  const totals = pageData.reduce(
                    (acc, curr) => ({
                      maintenance: acc.maintenance + curr.maintenance,
                      tire: acc.tire + curr.tire,
                      part: acc.part + curr.part,
                      total: acc.total + curr.total
                    }),
                    { maintenance: 0, tire: 0, part: 0, total: 0 }
                  );

                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>Toplam</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {totals.maintenance.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        {totals.tire.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        {totals.part.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {totals.total.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
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