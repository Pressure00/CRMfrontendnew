interface DateRangeFilterProps {
  dateFrom: string
  dateTo: string
  onDateFromChange: (val: string) => void
  onDateToChange: (val: string) => void
}

export default function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-win-text-secondary whitespace-nowrap">От:</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="win-input py-1.5 text-xs w-36"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-win-text-secondary whitespace-nowrap">До:</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="win-input py-1.5 text-xs w-36"
        />
      </div>
      {(dateFrom || dateTo) && (
        <button
          onClick={() => { onDateFromChange(''); onDateToChange('') }}
          className="text-xs text-primary hover:underline whitespace-nowrap"
        >
          Сбросить
        </button>
      )}
    </div>
  )
}