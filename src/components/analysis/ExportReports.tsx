import React, { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Button } from '../ui/Button';
import { Transaction } from '../../types';
import { CategoryBreakdownItem } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../lib/utils';

export interface ExportReportsProps {
  transactions: Transaction[];
  categoryBreakdown: CategoryBreakdownItem[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  dailyAverage: number;
  periodLabel: string;
  referenceDate?: Date;
  className?: string;
}

export const ExportReports: React.FC<ExportReportsProps> = ({
  transactions,
  categoryBreakdown,
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  dailyAverage,
  periodLabel,
  className = '',
}) => {
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // 1. Export to Excel (.xlsx)
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Resumen
      const resumenAoa: (string | number)[][] = [
        ['REPORTE FINANCIERO — GESSY'],
        ['Período Analizado', periodLabel],
        ['Fecha de Generación', new Date().toLocaleDateString('es-PE')],
        [],
        ['MÉTRICAS PRINCIPALES', 'MONTO (S/)'],
        ['Total Ingresos', totalIncome],
        ['Total Gastos', totalExpenses],
        ['Ahorro Neto', netSavings],
        ['Tasa de Ahorro', `${savingsRate}%`],
        ['Gasto Promedio Diario', dailyAverage],
        [],
        ['DESGLOSE DE GASTOS POR CATEGORÍA'],
        ['Categoría', 'Total Gastado (S/)', '% del Total', 'N° Transacciones'],
      ];

      for (const cat of categoryBreakdown) {
        resumenAoa.push([
          `${cat.icon} ${cat.name}`,
          cat.amount,
          `${cat.percentage}%`,
          cat.count,
        ]);
      }

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenAoa);
      wsResumen['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
        { wch: 18 },
      ];
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Sheet 2: Transacciones
      const txHeaders = [
        'Fecha',
        'Tipo',
        'Categoría',
        'Descripción',
        'Monto (S/)',
        'Recurrente',
      ];

      const txRows: (string | number)[][] = transactions.map((tx) => [
        tx.transaction_date,
        tx.type === 'income' ? 'Ingreso' : 'Gasto',
        tx.category?.name || 'General',
        tx.description || '-',
        tx.amount,
        tx.is_recurring ? 'Sí' : 'No',
      ]);

      const wsTransacciones = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]);
      wsTransacciones['!cols'] = [
        { wch: 14 },
        { wch: 12 },
        { wch: 22 },
        { wch: 32 },
        { wch: 14 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, wsTransacciones, 'Transacciones');

      // Trigger instant download
      XLSX.writeFile(wb, 'Reporte_Financiero_Gessy.xlsx');
    } catch (error) {
      console.error('Error al exportar reporte Excel:', error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // 2. Export to PDF (.pdf)
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 0;

      // Header Banner (Slate-900)
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 28, 'F');

      // Indigo accent line
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 27, pageWidth, 2, 'F');

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('GESSY', 14, 13);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(199, 210, 254);
      doc.text('Reporte Financiero Personal y Analítica', 14, 20);

      // Period Info Right-Aligned
      doc.setFontSize(8.5);
      doc.setTextColor(241, 245, 249);
      doc.text(`Período: ${periodLabel}`, pageWidth - 14, 13, { align: 'right' });
      doc.text(
        `Generado: ${new Date().toLocaleDateString('es-PE')}`,
        pageWidth - 14,
        20,
        { align: 'right' }
      );

      y = 38;

      // 4 Summary KPI Cards
      const boxWidth = (pageWidth - 28 - 9) / 4;
      const boxHeight = 22;

      const kpis = [
        { label: 'INGRESOS', val: formatCurrency(totalIncome), color: [16, 185, 129] },
        { label: 'GASTOS', val: formatCurrency(totalExpenses), color: [244, 63, 94] },
        { label: 'AHORRO NETO', val: formatCurrency(netSavings), color: [99, 102, 241] },
        { label: 'TASA AHORRO', val: `${savingsRate}%`, color: [245, 158, 11] },
      ];

      kpis.forEach((kpi, idx) => {
        const bx = 14 + idx * (boxWidth + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'FD');

        doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.rect(bx, y, boxWidth, 1.5, 'F');

        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(kpi.label, bx + 3.5, y + 8);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.val, bx + 3.5, y + 16);
      });

      y += boxHeight + 10;

      // Category Breakdown Table Section
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Distribución de Gastos por Categoría', 14, y);
      y += 5;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Categoría', 18, y + 4.8);
      doc.text('N° Movimientos', 90, y + 4.8);
      doc.text('% del Total', 130, y + 4.8);
      doc.text('Monto', pageWidth - 18, y + 4.8, { align: 'right' });
      y += 7;

      doc.setFont('helvetica', 'normal');
      if (categoryBreakdown.length === 0) {
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text('No hay gastos registrados en este período.', 18, y + 5);
        y += 8;
      } else {
        const topCategories = categoryBreakdown.slice(0, 8);
        topCategories.forEach((cat, idx) => {
          if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y, pageWidth - 28, 6.5, 'F');
          }
          doc.setTextColor(30, 41, 59);
          doc.setFontSize(8);
          doc.text(cat.name, 18, y + 4.5);
          doc.text(String(cat.count), 90, y + 4.5);
          doc.text(`${cat.percentage}%`, 130, y + 4.5);
          doc.setFont('helvetica', 'bold');
          doc.text(formatCurrency(cat.amount), pageWidth - 18, y + 4.5, {
            align: 'right',
          });
          doc.setFont('helvetica', 'normal');
          y += 6.5;
        });
      }

      y += 8;

      // Transactions Section
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Transacciones del Período (Últimas Registradas)', 14, y);
      y += 5;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha', 18, y + 4.8);
      doc.text('Tipo', 45, y + 4.8);
      doc.text('Categoría', 75, y + 4.8);
      doc.text('Descripción', 115, y + 4.8);
      doc.text('Monto', pageWidth - 18, y + 4.8, { align: 'right' });
      y += 7;

      doc.setFont('helvetica', 'normal');
      if (transactions.length === 0) {
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text('No hay transacciones registradas en este período.', 18, y + 5);
        y += 8;
      } else {
        const txToShow = transactions.slice(0, 16);
        txToShow.forEach((tx, idx) => {
          if (y > 270) {
            doc.addPage();
            y = 15;
          }
          if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y, pageWidth - 28, 6.5, 'F');
          }
          doc.setTextColor(30, 41, 59);
          doc.setFontSize(8);
          doc.text(tx.transaction_date, 18, y + 4.5);

          if (tx.type === 'income') {
            doc.setTextColor(16, 185, 129);
            doc.text('Ingreso', 45, y + 4.5);
          } else {
            doc.setTextColor(244, 63, 94);
            doc.text('Gasto', 45, y + 4.5);
          }

          doc.setTextColor(30, 41, 59);
          doc.text(tx.category?.name || 'General', 75, y + 4.5);
          const desc = (tx.description || '-').substring(0, 22);
          doc.text(desc, 115, y + 4.5);

          doc.setFont('helvetica', 'bold');
          doc.text(formatCurrency(tx.amount), pageWidth - 18, y + 4.5, {
            align: 'right',
          });
          doc.setFont('helvetica', 'normal');
          y += 6.5;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Gessy — Control y Gestión de Finanzas Personales. Generado automáticamente.',
        pageWidth / 2,
        287,
        { align: 'center' }
      );

      doc.save('Reporte_Gessy.pdf');
    } catch (error) {
      console.error('Error al exportar reporte PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        icon={FileSpreadsheet}
        loading={isExportingExcel}
        loadingText="Exportando..."
        onClick={handleExportExcel}
        title="Descargar reporte en formato Excel (.xlsx)"
      >
        Excel
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={FileText}
        loading={isExportingPDF}
        loadingText="Exportando..."
        onClick={handleExportPDF}
        title="Descargar reporte en formato PDF (.pdf)"
      >
        PDF
      </Button>
    </div>
  );
};
