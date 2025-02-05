import { Component, NgModule, ContentChild, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListItem, MyException } from './multiselect.model';
import { ClickOutsideDirective } from './clickOutside';
import { ListFilterPipe } from './list-filter';
import { Item, TemplateRenderer } from './menu-item';
export var DROPDOWN_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return AngularMultiSelect; }),
    multi: true
};
export var DROPDOWN_CONTROL_VALIDATION = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(function () { return AngularMultiSelect; }),
    multi: true,
};
var noop = function () {
};
var AngularMultiSelect = /** @class */ (function () {
    function AngularMultiSelect() {
        this.onSelect = new EventEmitter();
        this.onDeSelect = new EventEmitter();
        this.onSelectAll = new EventEmitter();
        this.onDeSelectAll = new EventEmitter();
        this.isActive = false;
        this.isSelectAll = false;
        this.filter = new ListItem();
        this.defaultSettings = {
            singleSelection: false,
            text: 'Select',
            enableCheckAll: true,
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: false,
            maxHeight: 300,
            badgeShowLimit: 999999999999,
            classes: '',
            disabled: false,
            searchPlaceholderText: 'Search',
            showCheckbox: true,
            noDataLabel: 'No Data Available'
        };
        this.onTouchedCallback = noop;
        this.onChangeCallback = noop;
    }
    AngularMultiSelect.prototype.ngOnInit = function () {
        this.settings = Object.assign(this.defaultSettings, this.settings);
        if (this.settings.groupBy) {
            this.groupedData = this.transformData(this.data, this.settings.groupBy);
        }
    };
    AngularMultiSelect.prototype.ngOnChanges = function (changes) {
        if (changes.data && !changes.data.firstChange) {
            if (this.settings.groupBy) {
                this.groupedData = this.transformData(this.data, this.settings.groupBy);
                if (this.data.length == 0) {
                    this.selectedItems = [];
                }
            }
        }
    };
    AngularMultiSelect.prototype.ngDoCheck = function () {
        if (this.selectedItems) {
            if (this.selectedItems.length == 0 || this.data.length == 0 || this.selectedItems.length < this.data.length) {
                this.isSelectAll = false;
            }
        }
    };
    AngularMultiSelect.prototype.onItemClick = function (item, index, evt) {
        if (this.settings.disabled) {
            return false;
        }
        var found = this.isSelected(item);
        var limit = this.selectedItems.length < this.settings.limitSelection ? true : false;
        if (!found) {
            if (this.settings.limitSelection) {
                if (limit) {
                    this.addSelected(item);
                    this.onSelect.emit(item);
                }
            }
            else {
                this.addSelected(item);
                this.onSelect.emit(item);
            }
        }
        else {
            this.removeSelected(item);
            this.onDeSelect.emit(item);
        }
        if (this.isSelectAll || this.data.length > this.selectedItems.length) {
            this.isSelectAll = false;
        }
        if (this.data.length == this.selectedItems.length) {
            this.isSelectAll = true;
        }
    };
    AngularMultiSelect.prototype.validate = function (c) {
        return null;
    };
    AngularMultiSelect.prototype.writeValue = function (value) {
        if (value !== undefined && value !== null) {
            if (this.settings.singleSelection) {
                try {
                    if (value.length > 1) {
                        this.selectedItems = [value[0]];
                        throw new MyException(404, { "msg": "Single Selection Mode, Selected Items cannot have more than one item." });
                    }
                    else {
                        this.selectedItems = value;
                    }
                }
                catch (e) {
                    console.error(e.body.msg);
                }
            }
            else {
                if (this.settings.limitSelection) {
                    this.selectedItems = value.splice(0, this.settings.limitSelection);
                }
                else {
                    this.selectedItems = value;
                }
                if (this.selectedItems.length === this.data.length && this.data.length > 0) {
                    this.isSelectAll = true;
                }
            }
        }
        else {
            this.selectedItems = [];
        }
    };
    //From ControlValueAccessor interface
    AngularMultiSelect.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    //From ControlValueAccessor interface
    AngularMultiSelect.prototype.registerOnTouched = function (fn) {
        this.onTouchedCallback = fn;
    };
    AngularMultiSelect.prototype.trackByFn = function (index, item) {
        return item.id;
    };
    AngularMultiSelect.prototype.isSelected = function (clickedItem) {
        var found = false;
        this.selectedItems && this.selectedItems.forEach(function (item) {
            if (clickedItem.id === item.id) {
                found = true;
            }
        });
        return found;
    };
    AngularMultiSelect.prototype.addSelected = function (item) {
        if (this.settings.singleSelection) {
            this.selectedItems = [];
            this.selectedItems.push(item);
        }
        else
            this.selectedItems.push(item);
        this.onChangeCallback(this.selectedItems);
        this.onTouchedCallback(this.selectedItems);
    };
    AngularMultiSelect.prototype.removeSelected = function (clickedItem) {
        var _this = this;
        this.selectedItems && this.selectedItems.forEach(function (item) {
            if (clickedItem.id === item.id) {
                _this.selectedItems.splice(_this.selectedItems.indexOf(item), 1);
            }
        });
        this.onChangeCallback(this.selectedItems);
        this.onTouchedCallback(this.selectedItems);
    };
    AngularMultiSelect.prototype.toggleDropdown = function (evt) {
        if (this.settings.disabled) {
            return false;
        }
        this.isActive = !this.isActive;
        evt.preventDefault();
    };
    AngularMultiSelect.prototype.closeDropdown = function () {
        this.filter = new ListItem();
        this.isActive = false;
    };
    AngularMultiSelect.prototype.toggleSelectAll = function () {
        if (!this.isSelectAll) {
            this.selectedItems = [];
            this.selectedItems = this.data.slice();
            this.isSelectAll = true;
            this.onChangeCallback(this.selectedItems);
            this.onTouchedCallback(this.selectedItems);
            this.onSelectAll.emit(this.selectedItems);
        }
        else {
            this.selectedItems = [];
            this.isSelectAll = false;
            this.onChangeCallback(this.selectedItems);
            this.onTouchedCallback(this.selectedItems);
            this.onDeSelectAll.emit(this.selectedItems);
        }
    };
    AngularMultiSelect.prototype.transformData = function (arr, field) {
        var groupedObj = arr.reduce(function (prev, cur) {
            if (!prev[cur[field]]) {
                prev[cur[field]] = [cur];
            }
            else {
                prev[cur[field]].push(cur);
            }
            return prev;
        }, {});
        var tempArr = [];
        Object.keys(groupedObj).map(function (x) {
            tempArr.push({ key: x, value: groupedObj[x] });
        });
        return tempArr;
    };
    AngularMultiSelect.decorators = [
        { type: Component, args: [{
                    selector: 'angular2-multiselect',
                    template: "\n      <div class=\"cuppa-dropdown\" (clickOutside)=\"closeDropdown()\">\n          <div class=\"selected-list\">\n              <div class=\"c-btn\" (click)=\"toggleDropdown($event)\" [ngClass]=\"{'disabled': settings.disabled}\">\n                  <span *ngIf=\"selectedItems?.length == 0\">{{settings.text}}</span>\n                  <span *ngIf=\"settings.singleSelection\">\n                      <span *ngFor=\"let item of selectedItems;trackBy: trackByFn;\">\n                          {{item.name}}\n                      </span>\n                  </span>\n                  <div class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && !settings.singleSelection\">\n                      <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn;let k = index\" [hidden]=\"k > settings.badgeShowLimit-1\">\n                          <span class=\"c-label\">{{item.name}}</span>\n                          <span class=\"fa fa-remove\" (click)=\"onItemClick(item,k,$event)\"></span>\n                      </div>\n                  </div> \n                  <span *ngIf=\"selectedItems?.length > settings.badgeShowLimit\">+{{selectedItems?.length - settings.badgeShowLimit }}</span>\n                  <span class=\"fa\" [ngClass]=\"{'fa-angle-down': !isActive,'fa-angle-up':isActive}\"></span>\n              </div>      \n          </div>\n          <div class=\"dropdown-list\" [hidden]=\"!isActive\">\n          <div class=\"arrow-up arrow-2\"></div>\n          <div class=\"arrow-up\"></div>\n          <div class=\"list-area\">\n              <div class=\"pure-checkbox select-all\" *ngIf=\"settings.enableCheckAll && !settings.singleSelection && !settings.limitSelection\" (click)=\"toggleSelectAll()\">\n                  <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"/>\n                  <label>\n                      <span [hidden]=\"isSelectAll\">{{settings.selectAllText}}</span>\n                      <span [hidden]=\"!isSelectAll\">{{settings.unSelectAllText}}</span>\n                  </label>\n              </div>   \n              <div class=\"list-filter\" *ngIf=\"settings.enableSearchFilter\">\n                  <span class=\"fa fa-search\"></span>\n                  <input type=\"text\" [placeholder]=\"settings.searchPlaceholderText\" [(ngModel)]=\"filter.name\">\n              </div> \n          <ul *ngIf=\"!settings.groupBy\" [style.maxHeight] = \"settings.maxHeight+'px'\">\n              <span *ngIf=\"itemTempl\">\n                  <li *ngFor=\"let item of data | listFilter:filter; let i = index;\" (click)=\"onItemClick(item,i,$event)\" class=\"pure-checkbox\">\n                  <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"/>\n                  <label></label>\n                  <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n              </li>\n              </span>\n              <span *ngIf=\"!itemTempl\" >\n              <li *ngFor=\"let item of data | listFilter:filter; let i = index;\" (click)=\"onItemClick(item,i,$event)\" class=\"pure-checkbox\">\n                  <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"/>\n                  <label>{{item.name}}</label>\n              </li>\n              </span>\n          </ul>\n          <div *ngIf=\"settings.groupBy\" [style.maxHeight] = \"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n          <ul *ngFor=\"let obj of groupedData ; let i = index;\" class=\"list-grp\">\n              <h4>{{obj.key}}</h4>\n              <span *ngIf=\"itemTempl\" >\n              <li *ngFor=\"let item of obj.value | listFilter:filter; let i = index;\" (click)=\"onItemClick(item,i,$event)\" class=\"pure-checkbox\">\n                  <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"/>\n                  <label></label>\n                  <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n              </li>\n              </span>\n              <span *ngIf=\"!itemTempl\" >\n              <li *ngFor=\"let item of obj.value | listFilter:filter; let i = index;\" (click)=\"onItemClick(item,i,$event)\" class=\"pure-checkbox\">\n                  <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"/>\n                  <label>{{item.name}}</label>\n              </li>\n              </span>\n          </ul>\n          </div>\n          <h5 class=\"list-message\" *ngIf=\"data?.length == 0\">{{settings.noDataLabel}}</h5>\n          </div>\n          </div>\n      </div>\n    ",
                    host: { '[class]': 'defaultSettings.classes' },
                    styles: ["\n      .cuppa-dropdown{position:relative}.c-btn{display:inline-block;background:#fff;border:1px solid #ccc;border-radius:3px;font-size:14px;color:#333}.c-btn.disabled{background:#ccc}.c-btn:focus{outline:none}.selected-list .c-list{float:left;padding:0px;margin:0px}.selected-list .c-list .c-token{list-style:none;padding:0px 5px;background:#0079FE;color:#fff;border-radius:2px;margin-right:4px;float:left}.selected-list .c-list .c-token .c-label{display:block;float:left}.selected-list .c-list .c-token .fa-remove{margin-left:1px;font-size:12px;z-index:100000000}.selected-list .fa-angle-down,.selected-list .fa-angle-up{font-size:15pt;position:absolute;right:10px;top:25%}.selected-list .c-btn{width:100%;box-shadow:0px 1px 5px #959595;padding:10px;cursor:pointer;display:flex}.dropdown-list{position:absolute;padding-top:14px;width:100%;z-index:9999}.dropdown-list ul{padding:0px;list-style:none;overflow:auto;margin:0px}.dropdown-list ul li{padding:10px 10px;cursor:pointer;text-align:left}.dropdown-list ul li:first-child{padding-top:10px}.dropdown-list ul li:last-child{padding-bottom:10px}.dropdown-list ul li:hover{background:#f5f5f5}.dropdown-list ::-webkit-scrollbar{width:8px}.dropdown-list ::-webkit-scrollbar-thumb{background:#cccccc;border-radius:5px}.dropdown-list ::-webkit-scrollbar-track{background:#f2f2f2}.arrow-up{width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-bottom:15px solid #fff;margin-left:15px;position:absolute;top:0}.arrow-2{border-bottom:15px solid #ccc;top:-1px}.list-area{border:1px solid #ccc;border-radius:3px;background:#fff;margin:0px;box-shadow:0px 1px 5px #959595}.select-all{padding:10px;border-bottom:1px solid #ccc;text-align:left}.list-filter{border-bottom:1px solid #ccc;position:relative}.list-filter input{border:0px;width:100%;height:35px;padding:0px 0px 0px 35px}.list-filter input:focus{outline:none}.list-filter .fa{position:absolute;top:10px;left:13px;color:#888}.pure-checkbox input[type=\"checkbox\"]{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.pure-checkbox input[type=\"checkbox\"]:focus+label:before,.pure-checkbox input[type=\"checkbox\"]:hover+label:before{border-color:#0079FE;background-color:#f2f2f2}.pure-checkbox input[type=\"checkbox\"]:active+label:before{transition-duration:0s}.pure-checkbox input[type=\"checkbox\"]+label{position:relative;padding-left:2em;vertical-align:middle;user-select:none;cursor:pointer;margin:0px;color:#000;font-weight:300}.pure-checkbox input[type=\"checkbox\"]+label:before{box-sizing:content-box;content:'';color:#0079FE;position:absolute;top:50%;left:0;width:14px;height:14px;margin-top:-9px;border:2px solid #0079FE;text-align:center;transition:all 0.4s ease}.pure-checkbox input[type=\"checkbox\"]+label:after{box-sizing:content-box;content:'';background-color:#0079FE;position:absolute;top:50%;left:4px;width:10px;height:10px;margin-top:-5px;transform:scale(0);transform-origin:50%;transition:transform 200ms ease-out}.pure-checkbox input[type=\"checkbox\"]:disabled+label:before{border-color:#cccccc}.pure-checkbox input[type=\"checkbox\"]:disabled:focus+label:before .pure-checkbox input[type=\"checkbox\"]:disabled:hover+label:before{background-color:inherit}.pure-checkbox input[type=\"checkbox\"]:disabled:checked+label:before{background-color:#cccccc}.pure-checkbox input[type=\"checkbox\"]+label:after{background-color:transparent;top:50%;left:4px;width:8px;height:3px;margin-top:-4px;border-style:solid;border-color:#ffffff;border-width:0 0 3px 3px;border-image:none;transform:rotate(-45deg) scale(0)}.pure-checkbox input[type=\"checkbox\"]:checked+label:after{content:'';transform:rotate(-45deg) scale(1);transition:transform 200ms ease-out}.pure-checkbox input[type=\"radio\"]:checked+label:before{animation:borderscale 300ms ease-in;background-color:white}.pure-checkbox input[type=\"radio\"]:checked+label:after{transform:scale(1)}.pure-checkbox input[type=\"radio\"]+label:before{border-radius:50%}.pure-checkbox input[type=\"checkbox\"]:checked+label:before{animation:borderscale 200ms ease-in;background:#0079FE}.pure-checkbox input[type=\"checkbox\"]:checked+label:after{transform:rotate(-45deg) scale(1)}@keyframes borderscale{50%{box-shadow:0 0 0 2px #0079FE}}.list-message{text-align:center}.list-grp{padding:0 15px !important}.list-grp h4{text-transform:capitalize;margin:15px 0px 0px 0px;font-size:14px;font-weight:700}.list-grp>li{padding-left:15px !important}\n    "],
                    providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR, DROPDOWN_CONTROL_VALIDATION]
                },] },
    ];
    /** @nocollapse */
    AngularMultiSelect.ctorParameters = function () { return []; };
    AngularMultiSelect.propDecorators = {
        'data': [{ type: Input },],
        'settings': [{ type: Input },],
        'onSelect': [{ type: Output, args: ['onSelect',] },],
        'onDeSelect': [{ type: Output, args: ['onDeSelect',] },],
        'onSelectAll': [{ type: Output, args: ['onSelectAll',] },],
        'onDeSelectAll': [{ type: Output, args: ['onDeSelectAll',] },],
        'itemTempl': [{ type: ContentChild, args: [Item,] },],
    };
    return AngularMultiSelect;
}());
export { AngularMultiSelect };
var AngularMultiSelectModule = /** @class */ (function () {
    function AngularMultiSelectModule() {
    }
    AngularMultiSelectModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule, FormsModule],
                    declarations: [AngularMultiSelect, ClickOutsideDirective, ListFilterPipe, Item, TemplateRenderer],
                    exports: [AngularMultiSelect, ClickOutsideDirective, ListFilterPipe, Item, TemplateRenderer]
                },] },
    ];
    /** @nocollapse */
    AngularMultiSelectModule.ctorParameters = function () { return []; };
    return AngularMultiSelectModule;
}());
export { AngularMultiSelectModule };
//# sourceMappingURL=multiselect.component.js.map