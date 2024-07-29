import { Column, ColumnOptions } from 'typeorm';

export function TimestampColumn(options?: ColumnOptions) {
  return process.env.NODE_ENV === 'test'
    ? Column({ type: 'datetime', ...options })
    : Column({ type: 'timestamp', precision: 6, ...options });
}

export function CreateTimestampColumn(options?: ColumnOptions) {
  return TimestampColumn({ 
    ...options, 
    default: process.env.NODE_ENV === 'test' 
      ? () => 'CURRENT_TIMESTAMP' 
      : () => 'CURRENT_TIMESTAMP(6)',
  });
}

export function UpdateTimestampColumn(options?: ColumnOptions) {
  return TimestampColumn({ 
    ...options, 
    default: process.env.NODE_ENV === 'test' 
      ? () => 'CURRENT_TIMESTAMP' 
      : () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: process.env.NODE_ENV === 'test' 
      ? 'CURRENT_TIMESTAMP' 
      : 'CURRENT_TIMESTAMP(6)',
  });
}