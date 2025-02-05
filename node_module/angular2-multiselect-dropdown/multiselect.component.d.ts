import { OnInit, SimpleChanges, OnChanges, EventEmitter } from '@angular/core';
import { ControlValueAccessor, Validator, FormControl } from '@angular/forms';
import { ListItem } from './multiselect.model';
import { DropdownSettings } from './multiselect.interface';
import { Item } from './menu-item';
export declare const DROPDOWN_CONTROL_VALUE_ACCESSOR: any;
export declare const DROPDOWN_CONTROL_VALIDATION: any;
export declare class AngularMultiSelect implements OnInit, ControlValueAccessor, OnChanges, Validator {
    data: Array<ListItem>;
    settings: DropdownSettings;
    onSelect: EventEmitter<ListItem>;
    onDeSelect: EventEmitter<ListItem>;
    onSelectAll: EventEmitter<Array<ListItem>>;
    onDeSelectAll: EventEmitter<Array<ListItem>>;
    itemTempl: Item;
    selectedItems: Array<ListItem>;
    isActive: boolean;
    isSelectAll: boolean;
    groupedData: Array<ListItem>;
    filter: ListItem;
    defaultSettings: DropdownSettings;
    parseError: boolean;
    constructor();
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngDoCheck(): void;
    onItemClick(item: ListItem, index: number, evt: Event): boolean;
    validate(c: FormControl): any;
    private onTouchedCallback;
    private onChangeCallback;
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    trackByFn(index: number, item: ListItem): Number;
    isSelected(clickedItem: ListItem): boolean;
    addSelected(item: ListItem): void;
    removeSelected(clickedItem: ListItem): void;
    toggleDropdown(evt: any): boolean;
    closeDropdown(): void;
    toggleSelectAll(): void;
    transformData(arr: Array<ListItem>, field: any): Array<ListItem>;
}
export declare class AngularMultiSelectModule {
}
