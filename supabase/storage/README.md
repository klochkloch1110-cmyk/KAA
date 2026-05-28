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
  trips/{tripId}/ttn/{documentId}.{ext}
  trips/{tripId}/supporting/{documentId}.{ext}
  shifts/{shiftId}/{documentId}.{ext}
  expenses/{expenseId}/{documentId}.{ext}
  chat/{messageId}/{documentId}.{ext}
```

## Правила

- оригинал документа сохраняется всегда;
- имя файла генерируется через UUID;
- человекочитаемое имя хранится в `documents.file_name`;
- доступ к файлам выдается через Supabase Storage policies или signed URL;
- водитель должен иметь доступ только к документам своих рейсов/смен;
- админ имеет доступ ко всем документам.

