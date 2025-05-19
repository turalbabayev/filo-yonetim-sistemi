import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Table, Spin, Empty, Select } from 'antd';
import { FuelService, MaintenanceService, TireChangeService, PartChangeService } from '@/lib/firebase/services';
import { FuelRecord, MaintenanceRecord, TireChangeRecord, PartChangeRecord } from '@/types/index';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';

const { RangePicker } = DatePicker;

interface YearlyData {
  year: number;
  fuelCost: number;
  maintenanceCost: number;
  tireCost: number;
  partCost: number;
  totalCost: number;
  fuelAmount: number;
  maintenanceCount: number;
  tireCount: number;
  partCount: number;
}

export default function YearlyComparisonReport() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(2, 'year').startOf('year'),
    dayjs().endOf('year')
  ]);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('cost');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fuelData, maintenanceData, tireData, partData] = await Promise.all([
        FuelService.getAll(),
        MaintenanceService.getAll(),
        TireChangeService.getAll(),
        PartChangeService.getAll()
      ]);

      const startYear = dateRange[0].year();
      const endYear = dateRange[1].year();
      const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

      const processedData: YearlyData[] = years.map(year => {
        const yearStart = dayjs().year(year).startOf('year');
        const yearEnd = dayjs().year(year).endOf('year');

        // Yakıt verileri
        const yearFuelRecords = fuelData.filter(record => {
          const recordDate = record.date.toDate();
          return recordDate >= yearStart.toDate() && recordDate <= yearEnd.toDate();
        });
        const fuelCost = yearFuelRecords.reduce((sum, record) => sum + record.cost, 0);
        const fuelAmount = yearFuelRecords.reduce((sum, record) => sum + record.amount, 0);

        // Bakım verileri
        const yearMaintenanceRecords = maintenanceData.filter(record => {
          const recordDate = record.date.toDate();
          return recordDate >= yearStart.toDate() && recordDate <= yearEnd.toDate();
        });
        const maintenanceCost = yearMaintenanceRecords.reduce((sum, record) => sum + record.cost, 0);

        // Lastik değişim verileri
        const yearTireRecords = tireData.filter(record => {
          const recordDate = record.date.toDate();
          return recordDate >= yearStart.toDate() && recordDate <= yearEnd.toDate();
        });
        const tireCost = yearTireRecords.reduce((sum, record) => sum + record.cost, 0);

        // Parça değişim verileri
        const yearPartRecords = partData.filter(record => {
          const recordDate = record.date.toDate();
          return recordDate >= yearStart.toDate() && recordDate <= yearEnd.toDate();
        });
        const partCost = yearPartRecords.reduce((sum, record) => sum + record.cost, 0);

        return {
          year,
          fuelCost,
          maintenanceCost,
          tireCost,
          partCost,
          totalCost: fuelCost + maintenanceCost + tireCost + partCost,
          fuelAmount,
          maintenanceCount: yearMaintenanceRecords.length,
          tireCount: yearTireRecords.length,
          partCount: yearPartRecords.length
        };
      });

      setYearlyData(processedData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Yıl',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Yakıt Maliyeti',
      dataIndex: 'fuelCost',
      key: 'fuelCost',
      render: (value: number) => value.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }),
    },
    {
      title: 'Bakım Maliyeti',
      dataIndex: 'maintenanceCost',
      key: 'maintenanceCost',
      render: (value: number) => value.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }),
    },
    {
      title: 'Lastik Maliyeti',
      dataIndex: 'tireCost',
      key: 'tireCost',
      render: (value: number) => value.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }),
    },
    {
      title: 'Parça Maliyeti',
      dataIndex: 'partCost',
      key: 'partCost',
      render: (value: number) => value.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }),
    },
    {
      title: 'Toplam Maliyet',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (value: number) => value.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }),
    },
    {
      title: 'Yakıt Miktarı (Lt)',
      dataIndex: 'fuelAmount',
      key: 'fuelAmount',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Bakım Sayısı',
      dataIndex: 'maintenanceCount',
      key: 'maintenanceCount',
    },
    {
      title: 'Lastik Değişim Sayısı',
      dataIndex: 'tireCount',
      key: 'tireCount',
    },
    {
      title: 'Parça Değişim Sayısı',
      dataIndex: 'partCount',
      key: 'partCount',
    },
  ];

  const chartConfig = {
    data: yearlyData,
    xField: 'year',
    yField: selectedMetric === 'cost' ? 'totalCost' : 
            selectedMetric === 'fuel' ? 'fuelAmount' :
            selectedMetric === 'maintenance' ? 'maintenanceCount' :
            selectedMetric === 'tire' ? 'tireCount' : 'partCount',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v: string) => {
          if (selectedMetric === 'cost') {
            return `${Number(v).toLocaleString('tr-TR')} ₺`;
          }
          return v;
        }
      }
    },
    legend: {
      position: 'top'
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yıl Aralığı
            </label>
            <RangePicker
              picker="year"
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
              Gösterge
            </label>
            <Select
              value={selectedMetric}
              onChange={setSelectedMetric}
              className="w-48"
            >
              <Select.Option value="cost">Toplam Maliyet</Select.Option>
              <Select.Option value="fuel">Yakıt Miktarı</Select.Option>
              <Select.Option value="maintenance">Bakım Sayısı</Select.Option>
              <Select.Option value="tire">Lastik Değişim Sayısı</Select.Option>
              <Select.Option value="part">Parça Değişim Sayısı</Select.Option>
            </Select>
          </div>
          <Button 
            type="primary" 
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
          >
            Raporu Getir
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        {yearlyData.length > 0 ? (
          <>
            <Card title="Yıllık Karşılaştırma Grafiği">
              <Line {...chartConfig} />
            </Card>

            <Card title="Detaylı Yıllık Veriler">
              <Table
                dataSource={yearlyData}
                columns={columns}
                rowKey="year"
                pagination={false}
                scroll={{ x: true }}
                summary={pageData => {
                  const totals = pageData.reduce(
                    (acc, curr) => ({
                      fuelCost: acc.fuelCost + curr.fuelCost,
                      maintenanceCost: acc.maintenanceCost + curr.maintenanceCost,
                      tireCost: acc.tireCost + curr.tireCost,
                      partCost: acc.partCost + curr.partCost,
                      totalCost: acc.totalCost + curr.totalCost,
                      fuelAmount: acc.fuelAmount + curr.fuelAmount,
                      maintenanceCount: acc.maintenanceCount + curr.maintenanceCount,
                      tireCount: acc.tireCount + curr.tireCount,
                      partCount: acc.partCount + curr.partCount
                    }),
                    {
                      fuelCost: 0,
                      maintenanceCost: 0,
                      tireCost: 0,
                      partCost: 0,
                      totalCost: 0,
                      fuelAmount: 0,
                      maintenanceCount: 0,
                      tireCount: 0,
                      partCount: 0
                    }
                  );

                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>Toplam</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {totals.fuelCost.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        {totals.maintenanceCost.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        {totals.tireCost.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {totals.partCost.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        {totals.totalCost.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        {totals.fuelAmount.toFixed(2)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        {totals.maintenanceCount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8}>
                        {totals.tireCount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={9}>
                        {totals.partCount}
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