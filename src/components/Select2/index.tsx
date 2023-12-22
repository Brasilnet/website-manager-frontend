import React from "react";
import Select, { Props as SelectProps } from "react-select";
import select2Styles from "./styles";
import { OptionType } from "src/interfaces/ISelect2";

export default function Select2(props: SelectProps<OptionType>) {
  return (
    <Select 
      {...props} 
      styles={select2Styles}
      noOptionsMessage={() => 'Sem itens disponíveis'} 
    />
  );
}