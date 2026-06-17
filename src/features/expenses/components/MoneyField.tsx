'use client';

import { useState } from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

/** "1500000" -> "1.500.000" (rỗng nếu không có chữ số). */
const fmt = (digits: string) => (digits ? Number(digits).toLocaleString('vi-VN') : '');

type Props = Omit<TextFieldProps, 'value' | 'onChange' | 'defaultValue' | 'type'> & {
  /** Tên field — submit giá trị thô (chỉ chữ số) qua input ẩn. */
  name: string;
  /** Giá trị khởi tạo (đồng). */
  initial?: number | string;
};

/**
 * Ô nhập tiền có dấu phân cách hàng nghìn. Hiển thị "1.500.000",
 * nhưng submit giá trị thô "1500000" qua input ẩn cùng `name`.
 */
export default function MoneyField({ name, initial = '', slotProps, ...rest }: Props) {
  const [raw, setRaw] = useState(String(initial).replace(/\D/g, ''));

  return (
    <>
      <input type="hidden" name={name} value={raw} />
      <TextField
        {...rest}
        type="text"
        value={fmt(raw)}
        onChange={(e) => setRaw(e.target.value.replace(/\D/g, ''))}
        slotProps={{
          ...slotProps,
          input: {
            endAdornment: <InputAdornment position="end">₫</InputAdornment>,
            ...slotProps?.input,
          },
          htmlInput: { inputMode: 'numeric', ...slotProps?.htmlInput },
        }}
      />
    </>
  );
}
