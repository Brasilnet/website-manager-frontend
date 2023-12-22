import { StylesConfig } from "react-select";

interface OptionType {
  label: string;
  value: string;
}

const select2Styles: StylesConfig<OptionType, false> = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: 4,
    padding: 2,
    borderColor: state.isFocused ? '#80bdff' : '#e0e0e0',
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#80bdff' : provided.borderColor,
    }
  }),
};

export default select2Styles;
