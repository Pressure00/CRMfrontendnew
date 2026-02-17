// Режимы деклараций
export const DECLARATION_REGIMES = [
  'ЭК/10', 'ЭК/11', 'ЭК/12', 'ИМ/40', 'ИМ/41', 'ИМ/42',
  'ИМ/51', 'ЭК/51', 'ЭК/61', 'ИМ/61', 'ИМ/70', 'ИМ/71',
  'ЭК/71', 'ИМ/72', 'ЭК/72', 'ИМ/73', 'ЭК/73', 'ИМ/74',
  'ЭК/74', 'ИМ/75', 'ЭК/75', 'ИМ/76', 'ТР/80', 'НД/40',
  'ПР/40', 'ПЕ/40', 'ВД/40', 'ВД/10', 'ВД/74',
]

// Типы транспорта
export const VEHICLE_TYPES = [
  { value: '10/МОРСКОЙ', label: '10/МОРСКОЙ' },
  { value: '20/ЖД', label: '20/ЖД' },
  { value: '30/АВТО', label: '30/АВТО' },
  { value: '40/АВИА', label: '40/АВИА' },
  { value: '71/ТРУБОПРОВОД', label: '71/ТРУБОПРОВОД' },
  { value: '72/ЛЭП', label: '72/ЛЭП' },
  { value: '80/РЕЧНОЙ', label: '80/РЕЧНОЙ' },
  { value: '90/САМОХОД', label: '90/САМОХОД' },
]

// Приоритеты задач
export const TASK_PRIORITIES = [
  { value: 'urgent', label: 'Срочный', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'Высокий приоритет', color: 'bg-orange-100 text-orange-800' },
  { value: 'normal', label: 'Обычный', color: 'bg-blue-100 text-blue-800' },
]

// Статусы задач
export const TASK_STATUSES = [
  { value: 'new', label: 'Новая', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'В работе', color: 'bg-blue-100 text-blue-800' },
  { value: 'waiting', label: 'Ожидание', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'on_review', label: 'На проверке', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Завершена', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Отменена', color: 'bg-red-100 text-red-800' },
  { value: 'frozen', label: 'Заморожена', color: 'bg-cyan-100 text-cyan-800' },
]

// Статусы сертификатов
export const CERTIFICATE_STATUSES = [
  { value: 'new', label: 'Новый', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'В процессе', color: 'bg-blue-100 text-blue-800' },
  { value: 'waiting_payment', label: 'Ждем оплату', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'on_review', label: 'На проверке', color: 'bg-purple-100 text-purple-800' },
  { value: 'review_confirmed', label: 'Подтвержден', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'payment_confirmed', label: 'Оплата подтверждена', color: 'bg-teal-100 text-teal-800' },
  { value: 'completed', label: 'Завершено', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Отклонен', color: 'bg-red-100 text-red-800' },
]

// Роли пользователей
export const USER_ROLES = [
  { value: 'director', label: 'Директор' },
  { value: 'senior', label: 'Старший' },
  { value: 'employee', label: 'Сотрудник' },
]

// Типы деятельности
export const ACTIVITY_TYPES = [
  { value: 'declarant', label: 'Декларант' },
  { value: 'certification', label: 'Сертификация' },
]