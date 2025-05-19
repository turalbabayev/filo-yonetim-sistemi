'use client';

import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Table, Spin, Empty } from 'antd';
import { 
  MaintenanceService, 
  TireChangeService, 
  PartChangeService, 
  VehicleService 
} from '@/lib/firebase/services';
import { Vehicle } from '@/types';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';

const { RangePicker } = DatePicker;

interface TypeExpenseData {
  date: string;
  type: 'kiralik' | 'ozmal';
  maintenance: number;
  tire: number;
  part: number;
  total: number;
}

export default function VehicleTypeExpenseReport() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenseData, setExpenseData] = useState<TypeExpenseData[]>([]);

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

      // Günlük ve araç türüne göre harcamaları hesapla
      const expenseMap = new Map<string, Map<'kiralik' | 'ozmal', TypeExpenseData>>();

      // Bakım harcamaları
      maintenances.forEach(m => {
        const date = m.date.toDate();
        if (date < startDate || date > endDate) return;

        const vehicle = vehicles.find(v => v.id === m.vehicleId);
        if (!vehicle) return;

        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const typeMap = expenseMap.get(dateStr) || new Map();
        
        const existing = typeMap.get(vehicle.type) || {
          date: dateStr,
          type: vehicle.type,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };

        existing.maintenance += m.cost;
        existing.total += m.cost;
        typeMap.set(vehicle.type, existing);
        expenseMap.set(dateStr, typeMap);
      });

      // Lastik harcamaları
      tireChanges.forEach(t => {
        const date = t.date.toDate();
        if (date < startDate || date > endDate) return;

        const vehicle = vehicles.find(v => v.id === t.vehicleId);
        if (!vehicle) return;

        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const typeMap = expenseMap.get(dateStr) || new Map();
        
        const existing = typeMap.get(vehicle.type) || {
          date: dateStr,
          type: vehicle.type,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };

        existing.tire += t.cost;
        existing.total += t.cost;
        typeMap.set(vehicle.type, existing);
        expenseMap.set(dateStr, typeMap);
      });

      // Parça harcamaları
      partChanges.forEach(p => {
        const date = p.date.toDate();
        if (date < startDate || date > endDate) return;

        const vehicle = vehicles.find(v => v.id === p.vehicleId);
        if (!vehicle) return;

        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const typeMap = expenseMap.get(dateStr) || new Map();
        
        const existing = typeMap.get(vehicle.type) || {
          date: dateStr,
          type: vehicle.type,
          maintenance: 0,
          tire: 0,
          part: 0,
          total: 0
        };

        existing.part += p.cost;
        existing.total += p.cost;
        typeMap.set(vehicle.type, existing);
        expenseMap.set(dateStr, typeMap);
      });

      // Düz dizi haline getir
      const processedData: TypeExpenseData[] = [];
      expenseMap.forEach(typeMap => {
        typeMap.forEach(data => {
          processedData.push(data);
        });
      });

      // Tarihe göre sırala
      processedData.sort((a, b) => a.date.localeCompare(b.date));

      setExpenseData(processedData);
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
      title: 'Araç Türü',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type === 'kiralik' ? 'Kiralık' : 'Özmal'
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
            <Card title="Araç Türüne Göre Harcama Grafiği">
              <Line {...chartConfig} />
            </Card>

            <Card title="Harcama Detayları">
              <Table
                dataSource={expenseData}
                columns={columns}
                rowKey={(record) => `${record.date}-${record.type}`}
                pagination={false}
                scroll={{ x: true }}
                summary={pageData => {
                  const totals = {
                    kiralik: pageData
                      .filter(d => d.type === 'kiralik')
                      .reduce((acc, curr) => ({
                        maintenance: acc.maintenance + curr.maintenance,
                        tire: acc.tire + curr.tire,
                        part: acc.part + curr.part,
                        total: acc.total + curr.total
                      }), { maintenance: 0, tire: 0, part: 0, total: 0 }),
                    ozmal: pageData
                      .filter(d => d.type === 'ozmal')
                      .reduce((acc, curr) => ({
                        maintenance: acc.maintenance + curr.maintenance,
                        tire: acc.tire + curr.tire,
                        part: acc.part + curr.part,
                        total: acc.total + curr.total
                      }), { maintenance: 0, tire: 0, part: 0, total: 0 })
                  };

                  return (
                    <>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>Kiralık Toplam</Table.Summary.Cell>
                        <Table.Summary.Cell index={1} />
                        <Table.Summary.Cell index={2}>
                          {totals.kiralik.maintenance.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          {totals.kiralik.tire.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          {totals.kiralik.part.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>
                          {totals.kiralik.total.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>Özmal Toplam</Table.Summary.Cell>
                        <Table.Summary.Cell index={1} />
                        <Table.Summary.Cell index={2}>
                          {totals.ozmal.maintenance.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          {totals.ozmal.tire.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          {totals.ozmal.part.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>
                          {totals.ozmal.total.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </>
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