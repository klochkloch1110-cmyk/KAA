# Storage AVL 84

## Buckets

На старте достаточно одного приватного bucket:

```text
documents
```

Bucket не должен быть публичным.

## Структура файлов

```text
documents/
  trips/{tripId}/ttn/{timestamp}_{fileName}
  trips/{tripId}/supporting/{documentId}.{ext}
  shifts/{shiftId}/{documentId}.{ext}
  expenses/{expenseId}/{documentId}.{ext}
  chat/{messageId}/{documentId}.{ext}
```

## Правила

- оригинал документа сохраняется всегда;
- для ТТН первого релиза клиент сохраняет файл в `trips/{tripId}/ttn/` с техническим префиксом времени;
- для следующих типов документов имя файла можно генерировать через UUID;
- человекочитаемое имя хранится в `documents.file_name`;
- доступ к файлам выдается через Supabase Storage policies или signed URL;
- водитель должен иметь доступ только к документам своих рейсов/смен;
- админ имеет доступ ко всем документам.

## Политики Storage

Прямые клиентские загрузки разрешены:

- в legacy-префикс `{userId}/...` для обратной совместимости;
- в `trips/{tripId}/...`, если `trips.driver_id = auth.uid()`;
- в `shifts/{shiftId}/...`, если `shifts.driver_id = auth.uid()`;
- админам и операторам для всех объектов bucket `documents`.
