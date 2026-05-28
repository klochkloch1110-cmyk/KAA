import { Search, Filter, Download, Eye, FileImage, Calendar, User, Truck, FileText, ZoomIn } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";

interface Document {
  id: string;
  type: string;
  tripId: string;
  orderId: string;
  driver: string;
  vehicle: string;
  customer: string;
  consignmentNote: string;
  date: string;
  uploadedAt: string;
  ocrStatus: string;
  fileUrl?: string;
}

const mockDocuments: Document[] = [
  {
    id: "DOC-001",
    type: "consignment_note",
    tripId: "TRP-001",
    orderId: "ORD-001",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    customer: "Стройком-М",
    consignmentNote: "СН-00123",
    date: "2026-05-21",
    uploadedAt: "2026-05-21T09:20:00",
    ocrStatus: "matched",
  },
  {
    id: "DOC-002",
    type: "consignment_note",
    tripId: "TRP-002",
    orderId: "ORD-001",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    customer: "Стройком-М",
    consignmentNote: "СН-00124",
    date: "2026-05-21",
    uploadedAt: "2026-05-21T11:35:00",
    ocrStatus: "mismatch",
  },
  {
    id: "DOC-003",
    type: "consignment_note",
    tripId: "TRP-003",
    orderId: "ORD-001",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    customer: "Стройком-М",
    consignmentNote: "СН-00125",
    date: "2026-05-21",
    uploadedAt: "2026-05-21T13:50:00",
    ocrStatus: "pending",
  },
  {
    id: "DOC-004",
    type: "consignment_note",
    tripId: "TRP-004",
    orderId: "ORD-002",
    driver: "Петров А.С.",
    vehicle: "В456ВО 77",
    customer: "БетонСтрой",
    consignmentNote: "СН-00126",
    date: "2026-05-21",
    uploadedAt: "2026-05-21T10:25:00",
    ocrStatus: "mismatch",
  },
  {
    id: "DOC-005",
    type: "consignment_note",
    tripId: "TRP-005",
    orderId: "ORD-004",
    driver: "Сидоров П.И.",
    vehicle: "С789НМ 77",
    customer: "Дорстрой",
    consignmentNote: "СН-00127",
    date: "2026-05-20",
    uploadedAt: "2026-05-20T14:35:00",
    ocrStatus: "matched",
  },
  {
    id: "DOC-006",
    type: "supporting",
    tripId: "TRP-001",
    orderId: "ORD-001",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    customer: "Стройком-М",
    consignmentNote: "—",
    date: "2026-05-21",
    uploadedAt: "2026-05-21T09:22:00",
    ocrStatus: "not_required",
  },
];

export function DocumentsView() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ocrFilter, setOcrFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.consignmentNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tripId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesOCR = ocrFilter === "all" || doc.ocrStatus === ocrFilter;

    return matchesSearch && matchesType && matchesOCR;
  });

  const consignmentNoteCount = mockDocuments.filter((d) => d.type === "consignment_note").length;
  const supportingCount = mockDocuments.filter((d) => d.type === "supporting").length;
  const ocrIssuesCount = mockDocuments.filter((d) => d.ocrStatus === "mismatch" || d.ocrStatus === "failed").length;

  const documentTypeLabels: Record<string, string> = {
    consignment_note: "ТТН",
    supporting: "Доп. документ",
    receipt: "Квитанция",
    invoice: "Накладная",
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Архив документов</h1>
              <p className="text-sm text-muted-foreground mt-1">Все документы и ТТН в одном месте</p>
            </div>
            <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
              <Download className="w-4 h-4" />
              Экспорт
            </button>
          </div>

          {/* Search and Date Filters */}
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по ТТН, водителю, заказчику..."
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 bg-input-background border border-border rounded-lg text-card-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="От"
              />
              <span className="text-sm text-muted-foreground">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 bg-input-background border border-border rounded-lg text-card-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="До"
              />
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <span className="text-sm font-medium text-muted-foreground">Тип:</span>
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Все ({mockDocuments.length})
            </button>
            <button
              onClick={() => setTypeFilter("consignment_note")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === "consignment_note"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              ТТН ({consignmentNoteCount})
            </button>
            <button
              onClick={() => setTypeFilter("supporting")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === "supporting"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Доп. документы ({supportingCount})
            </button>
          </div>

          {/* OCR Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">OCR статус:</span>
            <button
              onClick={() => setOcrFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                ocrFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setOcrFilter("matched")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                ocrFilter === "matched"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Совпадение
            </button>
            <button
              onClick={() => setOcrFilter("mismatch")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                ocrFilter === "mismatch"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Несовпадение ({ocrIssuesCount})
            </button>
            <button
              onClick={() => setOcrFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                ocrFilter === "pending"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Обработка
            </button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="p-8">
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Документ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Тип</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Рейс</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Заказчик</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Водитель</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ТС</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">OCR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <FileImage className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium text-card-foreground">{doc.id}</p>
                          {doc.consignmentNote !== "—" && (
                            <p className="text-xs text-muted-foreground font-mono">{doc.consignmentNote}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                        {documentTypeLabels[doc.type] || doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-primary">{doc.tripId}</p>
                        <p className="text-xs text-muted-foreground">{doc.orderId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{doc.customer}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{doc.driver}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{doc.vehicle}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">
                      <div>
                        <p>{new Date(doc.date).toLocaleDateString("ru-RU")}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.ocrStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Просмотр"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Скачать"
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <FileImage className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Документы не найдены</h3>
            <p className="text-sm text-muted-foreground">Попробуйте изменить параметры фильтрации</p>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">
                  {documentTypeLabels[selectedDocument.type]} {selectedDocument.id}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedDocument.consignmentNote !== "—" && selectedDocument.consignmentNote}
                </p>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <span className="text-xl text-muted-foreground">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* Sidebar with Info */}
              <div className="w-80 border-r border-border p-6 overflow-y-auto">
                <h3 className="font-semibold text-card-foreground mb-4">Информация о документе</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Статус OCR</p>
                    <StatusBadge status={selectedDocument.ocrStatus} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Рейс</p>
                    <p className="text-sm font-medium text-primary">{selectedDocument.tripId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Заказ</p>
                    <p className="text-sm font-medium text-card-foreground">{selectedDocument.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Заказчик</p>
                    <p className="text-sm font-medium text-card-foreground">{selectedDocument.customer}</p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-card-foreground">{selectedDocument.driver}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-card-foreground">{selectedDocument.vehicle}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground mb-1">Дата документа</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {new Date(selectedDocument.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Загружен</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {new Date(selectedDocument.uploadedAt).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              <div className="flex-1 bg-muted/30 p-6 flex items-center justify-center overflow-auto">
                <div className="bg-card rounded-lg border border-border p-4 max-w-3xl w-full">
                  <div className="aspect-[3/4] bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileImage className="w-24 h-24 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Предпросмотр документа</p>
                      <p className="text-xs text-muted-foreground mt-1">{selectedDocument.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
              <button className="px-5 py-2.5 border border-border rounded-lg text-card-foreground hover:bg-muted transition-colors flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Полный экран
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-5 py-2.5 border border-border rounded-lg text-card-foreground hover:bg-muted transition-colors"
                >
                  Закрыть
                </button>
                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Скачать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
