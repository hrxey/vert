import React from 'react'
import QRCode from 'react-qr-code'
import { Button } from '../ui/Button'
import { Download, Printer } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface MotorQRCodeProps {
  motorId: string
}

export const MotorQRCode: React.FC<MotorQRCodeProps> = ({ motorId }) => {
  const motorUrl = `${window.location.origin}/app/motors/${motorId}`
  const qrRef = React.useRef<HTMLDivElement>(null)

  const handlePrintPDF = async () => {
    if (!qrRef.current) return

    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 80
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2
      const y = 20

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)

      pdf.setFontSize(10)
      pdf.setTextColor(100)
      const urlText = motorUrl
      const textWidth = pdf.getTextWidth(urlText)
      const textX = (pdf.internal.pageSize.getWidth() - textWidth) / 2
      pdf.text(urlText, textX, y + imgHeight + 10)

      pdf.save(`motor-qr-${motorId}.pdf`)
    } catch (error) {
      console.error('Ошибка генерации PDF:', error)
      alert('Ошибка при создании PDF файла')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div ref={qrRef} className="bg-white p-8 rounded-lg border-2 border-gray-200">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              QR-код двигателя
            </h3>
            <p className="text-sm text-gray-600">
              Отсканируйте для просмотра информации
            </p>
          </div>

          <div className="flex justify-center">
            <QRCode
              value={motorUrl}
              size={256}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 break-all max-w-xs mx-auto">
              {motorUrl}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handlePrintPDF} variant="default">
          <Download className="w-4 h-4 mr-2" />
          Скачать PDF
        </Button>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Печать
        </Button>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
