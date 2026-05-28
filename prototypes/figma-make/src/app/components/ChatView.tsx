import { Send, Paperclip, Image as ImageIcon, User, Truck, FileText } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  type: "user" | "system";
  senderId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  attachment?: {
    type: "image" | "document";
    url: string;
    name: string;
  };
  entityLink?: {
    type: "order" | "trip" | "vehicle";
    id: string;
    label: string;
  };
}

const mockMessages: Message[] = [
  {
    id: "MSG-001",
    type: "system",
    senderId: "system",
    senderName: "Система",
    content: "Начало рабочего дня. Все водители на связи.",
    timestamp: "2026-05-21T08:00:00",
  },
  {
    id: "MSG-002",
    type: "user",
    senderId: "admin",
    senderName: "Администратор",
    senderRole: "Менеджер",
    content: "Доброе утро! Сегодня плотный график, все заказы актуальны.",
    timestamp: "2026-05-21T08:05:00",
  },
  {
    id: "MSG-003",
    type: "user",
    senderId: "driver1",
    senderName: "Иванов И.П.",
    senderRole: "Водитель",
    content: "Принято, выезжаю на объект.",
    timestamp: "2026-05-21T08:10:00",
  },
  {
    id: "MSG-004",
    type: "user",
    senderId: "driver2",
    senderName: "Петров А.С.",
    senderRole: "Водитель",
    content: "Подскажите адрес точки разгрузки по заказу ORD-002?",
    timestamp: "2026-05-21T09:15:00",
    entityLink: {
      type: "order",
      id: "ORD-002",
      label: "Заказ ORD-002",
    },
  },
  {
    id: "MSG-005",
    type: "user",
    senderId: "admin",
    senderName: "Администратор",
    senderRole: "Менеджер",
    content: "Промзона, участок 12. Координаты отправил в заказе.",
    timestamp: "2026-05-21T09:18:00",
    replyTo: {
      id: "MSG-004",
      senderName: "Петров А.С.",
      content: "Подскажите адрес точки разгрузки по заказу ORD-002?",
    },
  },
  {
    id: "MSG-006",
    type: "user",
    senderId: "driver1",
    senderName: "Иванов И.П.",
    senderRole: "Водитель",
    content: "Первый рейс выполнен, ТТН отправлен.",
    timestamp: "2026-05-21T09:30:00",
  },
  {
    id: "MSG-007",
    type: "system",
    senderId: "system",
    senderName: "Система",
    content: "Рейс TRP-001 завершён, документ на проверке.",
    timestamp: "2026-05-21T09:31:00",
    entityLink: {
      type: "trip",
      id: "TRP-001",
      label: "Рейс TRP-001",
    },
  },
];

export function ChatView() {
  const [messageText, setMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const handleSend = () => {
    if (!messageText.trim()) return;
    console.log("Sending message:", messageText);
    setMessageText("");
    setReplyingTo(null);
  };

  return (
    <div className="flex-1 overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Рабочий чат</h1>
          <p className="text-sm text-muted-foreground mt-1">Общение команды и уведомления</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {mockMessages.map((message) => {
            if (message.type === "system") {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-muted/50 rounded-lg px-4 py-2 max-w-2xl">
                    <p className="text-sm text-muted-foreground text-center">{message.content}</p>
                    {message.entityLink && (
                      <div className="mt-2 flex justify-center">
                        <button className="text-xs text-primary hover:underline flex items-center gap-1">
                          {message.entityLink.type === "trip" && <FileText className="w-3 h-3" />}
                          {message.entityLink.label}
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {new Date(message.timestamp).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            }

            const isCurrentUser = message.senderId === "admin";
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xl ${isCurrentUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {/* Sender Info */}
                  {!isCurrentUser && (
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        {message.senderRole === "Водитель" ? (
                          <Truck className="w-3 h-3 text-primary" />
                        ) : (
                          <User className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-card-foreground">{message.senderName}</span>
                      {message.senderRole && (
                        <span className="text-xs text-muted-foreground">• {message.senderRole}</span>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      isCurrentUser
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    }`}
                  >
                    {/* Reply Reference */}
                    {message.replyTo && (
                      <div
                        className={`mb-2 pb-2 border-l-2 pl-3 text-xs ${
                          isCurrentUser ? "border-primary-foreground/30" : "border-primary/30"
                        }`}
                      >
                        <p
                          className={`font-medium mb-0.5 ${
                            isCurrentUser ? "text-primary-foreground/80" : "text-primary"
                          }`}
                        >
                          {message.replyTo.senderName}
                        </p>
                        <p
                          className={`line-clamp-2 ${
                            isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {message.replyTo.content}
                        </p>
                      </div>
                    )}

                    {/* Message Content */}
                    <p className={`text-sm ${isCurrentUser ? "text-primary-foreground" : "text-card-foreground"}`}>
                      {message.content}
                    </p>

                    {/* Entity Link */}
                    {message.entityLink && (
                      <button
                        className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isCurrentUser
                            ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {message.entityLink.type === "order" && <FileText className="w-3 h-3" />}
                        {message.entityLink.type === "trip" && <FileText className="w-3 h-3" />}
                        {message.entityLink.type === "vehicle" && <Truck className="w-3 h-3" />}
                        {message.entityLink.label}
                      </button>
                    )}

                    {/* Timestamp */}
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  {!isCurrentUser && (
                    <button
                      onClick={() => setReplyingTo(message)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors px-1"
                    >
                      Ответить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-4xl mx-auto">
          {/* Reply Preview */}
          {replyingTo && (
            <div className="mb-3 bg-muted/50 rounded-lg p-3 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-primary mb-1">Ответ на сообщение:</p>
                <p className="text-sm text-card-foreground font-medium">{replyingTo.senderName}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{replyingTo.content}</p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-3">
            <button className="p-3 hover:bg-muted rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-3 hover:bg-muted rounded-lg transition-colors">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Написать сообщение..."
                rows={1}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Enter — отправить • Shift+Enter — новая строка
          </p>
        </div>
      </div>
    </div>
  );
}
