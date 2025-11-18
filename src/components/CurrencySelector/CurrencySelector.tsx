import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import React from 'react';
import { useCurrency } from '../../hooks/useCurrency';
import { useCurrencyContext } from './CurrencyProvider';

const CustomArrowDropDownIcon = ({ color }: { color: string }) => (
  <ArrowDropDownIcon sx={{ color, marginLeft: -9.5 }} />
);

const CustomArrowDropUpIcon = ({ color }: { color: string }) => (
  <ArrowDropUpIcon sx={{ color, marginLeft: -9.5 }} />
);

interface CurrencySelectorProps {
  showLabel?: boolean;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  minWidth?: number;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  showLabel = false,
  size = 'small',
  variant = 'outlined',
  minWidth = 80,
}) => {
  const { currencies } = useCurrency(); // should be of type CurrencyItem[]

  // Inside your component:
  const { currency, setCurrency } = useCurrencyContext();

  const [open, setOpen] = React.useState(false);

  const handleCurrencyChange = (event: SelectChangeEvent) => {
    setCurrency(event.target.value);
  };

  const filteredCurrencies = React.useMemo(
    () => currencies?.filter((item) => item.type === 'SELL'),
    [currencies]
  );
  const availableCurrencies = filteredCurrencies ?? [];
  const hasValidCurrency = availableCurrencies.some(
    (item) => item.ccy === currency
  );
  const selectValue = hasValidCurrency ? currency : '';

  React.useEffect(() => {
    if (!hasValidCurrency && availableCurrencies.length > 0) {
      setCurrency(availableCurrencies[0].ccy);
    }
  }, [availableCurrencies, hasValidCurrency, setCurrency]);

  const IconComponent = React.useMemo(
    () => () =>
      open ? (
        <CustomArrowDropUpIcon color={'#000'} />
      ) : (
        <CustomArrowDropDownIcon color={'#000'} />
      ),
    [open]
  );

  return (
    <Box display='flex' alignItems='center' sx={{ mt: -0.4 }}>
      {showLabel && (
        <Typography variant='body2' sx={{ mr: 0, color: '#7A6A55' }}>
          Currency:
        </Typography>
      )}
      <FormControl size={size} sx={{ minWidth }}>
        <Select
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          IconComponent={IconComponent}
          value={selectValue}
          onChange={handleCurrencyChange}
          variant={variant}
          displayEmpty
          disabled={availableCurrencies.length === 0}
          sx={{
            cursor: 'pointer',
            '& .MuiSelect-select': {
              py: size === 'small' ? 0.5 : 1,
              px: size === 'small' ? -2 : 2,
              color: '#000',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
          }}
        >
          {availableCurrencies.length === 0 && (
            <MenuItem value='' disabled>
              Loading...
            </MenuItem>
          )}
          {availableCurrencies.map((currency) => (
            <MenuItem key={currency.id} value={currency.ccy}>
              <Box display='flex' alignItems='center' gap={1}>
                <Typography>{currency.ccy}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CurrencySelector;
