import { MRT_ColumnDef, MRT_Row } from "material-react-table";
import React from "react";

type ClickHandler = (data: MRT_Row<any>) => void;

export interface ButtonProps {
    visible: (data: MRT_Row<any>) => boolean;
    title: (data: MRT_Row<any>) => string;
    variant: (data: MRT_Row<any>) => 'success' | 'primary' | 'danger' | 'warning';
    icon: (data: MRT_Row<any>) => React.JSX.Element;
    onClick: ClickHandler;
}

export interface IPaginationButtons {
    view?: ClickHandler | undefined;
    add?: () => void;
    edit?: ClickHandler | undefined;
    delete?: ClickHandler | undefined;
    custom?: ButtonProps;
}

export interface IPaginationProps {
    apiPath: string;
    columns: MRT_ColumnDef<any, any>[];
    rowsPerPage?: Array<number>;
    buttons?: IPaginationButtons;
}


export interface IPaginationColumnFilters {
    id: string;
    value: string | Array<any>;
  }
  
  export interface IPaginationColumnSorting {
    id: string;
    desc: boolean;
  }
  
  export interface IPaginationRequest {
    page: number;
    itemsPerPage: number;
    columnFilters: Array<IPaginationColumnFilters> | null;
    columnSorting: Array<IPaginationColumnSorting> | null;
    searchFilter: string | null;
  }