'use client';

import React, { useState } from 'react';
import { Tabs } from 'antd';
import ExpenseReport from '@/components/reports/ExpenseReport';
import MileageReport from '@/components/reports/MileageReport';
import DriverUsageReport from '@/components/reports/DriverUsageReport';
import PoolVehicleReport from '@/components/reports/PoolVehicleReport';
import VehicleTypeExpenseReport from '@/components/reports/VehicleTypeExpenseReport';
import ExpenseForecastReport from '@/components/reports/ExpenseForecastReport';
import YearlyComparisonReport from '@/components/reports/YearlyComparisonReport';
import { useAuth } from '@/contexts/AuthContext';

const { TabPane } = Tabs;

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('1');

  // Sadece firma yetkilisi ve dış kaynak personeli erişebilir
  if (user?.role !== 'firma_yetkilisi' && user?.role !== 'dis_kaynak_personeli') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Yetkisiz Erişim</h1>
        <p className="mt-2 text-sm text-gray-700">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Raporlar</h1>
        <p className="mt-2 text-sm text-gray-700">
          Araç ve filo yönetimi ile ilgili detaylı raporlar
        </p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Araç Harcamaları" key="1">
          <ExpenseReport />
        </TabPane>

        <TabPane tab="Kilometre Analizi" key="2">
          <MileageReport />
        </TabPane>

        <TabPane tab="Sürücü Kullanımı" key="3">
          <DriverUsageReport />
        </TabPane>

        <TabPane tab="Havuz Araçları" key="4">
          <PoolVehicleReport />
        </TabPane>

        <TabPane tab="Araç Türü Harcamaları" key="5">
          <VehicleTypeExpenseReport />
        </TabPane>

        <TabPane tab="Harcama Tahmini" key="6">
          <ExpenseForecastReport />
        </TabPane>

        <TabPane tab="Yıllık Karşılaştırma" key="7">
          <YearlyComparisonReport />
        </TabPane>
      </Tabs>
    </div>
  );
} 