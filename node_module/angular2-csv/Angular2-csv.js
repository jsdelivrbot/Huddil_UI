"use strict";
exports.__esModule = true;
var CsvConfigConsts = (function () {
    function CsvConfigConsts() {
    }
    return CsvConfigConsts;
}());
CsvConfigConsts.EOL = "\r\n";
CsvConfigConsts.BOM = "\ufeff";
CsvConfigConsts.DEFAULT_FIELD_SEPARATOR = ',';
CsvConfigConsts.DEFAULT_DECIMAL_SEPARATOR = '.';
CsvConfigConsts.DEFAULT_QUOTE = '"';
CsvConfigConsts.DEFAULT_SHOW_TITLE = false;
CsvConfigConsts.DEFAULT_TITLE = 'My Report';
CsvConfigConsts.DEFAULT_FILENAME = 'mycsv.csv';
CsvConfigConsts.DEFAULT_SHOW_LABELS = false;
CsvConfigConsts.DEFAULT_USE_BOM = true;
CsvConfigConsts.DEFAULT_HEADER = [];
exports.CsvConfigConsts = CsvConfigConsts;
exports.ConfigDefaults = {
    filename: CsvConfigConsts.DEFAULT_FILENAME,
    fieldSeparator: CsvConfigConsts.DEFAULT_FIELD_SEPARATOR,
    quoteStrings: CsvConfigConsts.DEFAULT_QUOTE,
    decimalseparator: CsvConfigConsts.DEFAULT_DECIMAL_SEPARATOR,
    showLabels: CsvConfigConsts.DEFAULT_SHOW_LABELS,
    showTitle: CsvConfigConsts.DEFAULT_SHOW_TITLE,
    title: CsvConfigConsts.DEFAULT_TITLE,
    useBom: CsvConfigConsts.DEFAULT_USE_BOM,
    headers: CsvConfigConsts.DEFAULT_HEADER
};
var Angular2Csv = (function () {
    function Angular2Csv(DataJSON, filename, options) {
        this.csv = "";
        var config = options || {};
        this.data = typeof DataJSON != 'object' ? JSON.parse(DataJSON) : DataJSON;
        this._options = objectAssign({}, exports.ConfigDefaults, config);
        if (this._options.filename) {
            this._options.filename = filename;
        }
        this.generateCsv();
    }
    /**
     * Generate and Download Csv
     */
    Angular2Csv.prototype.generateCsv = function () {
        if (this._options.useBom) {
            this.csv += CsvConfigConsts.BOM;
        }
        if (this._options.showTitle) {
            this.csv += this._options.title + '\r\n\n';
        }
        this.getHeaders();
        this.getBody();
        if (this.csv == '') {
            console.log("Invalid data");
            return;
        }
        var blob = new Blob([this.csv], { "type": "text/csv;charset=utf8;" });
        if (navigator.msSaveBlob) {
            var filename = this._options.filename.replace(/ /g, "_") + ".csv";
            navigator.msSaveBlob(blob, filename);
        }
        else {
            var uri = 'data:attachment/csv;charset=utf-8,' + encodeURI(this.csv);
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute('visibility', 'hidden');
            link.download = this._options.filename.replace(/ /g, "_") + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    /**
     * Create Headers
     */
    Angular2Csv.prototype.getHeaders = function () {
        if (this._options.headers.length > 0) {
            var row = "";
            for (var _i = 0, _a = this._options.headers; _i < _a.length; _i++) {
                var column = _a[_i];
                row += column + this._options.fieldSeparator;
            }
            row = row.slice(0, -1);
            this.csv += row + CsvConfigConsts.EOL;
        }
    };
    /**
     * Create Body
     */
    Angular2Csv.prototype.getBody = function () {
        for (var i = 0; i < this.data.length; i++) {
            var row = "";
            for (var index in this.data[i]) {
                row += this.formartData(this.data[i][index]) + this._options.fieldSeparator;
                ;
            }
            row = row.slice(0, -1);
            this.csv += row + CsvConfigConsts.EOL;
        }
    };
    /**
     * Format Data
     * @param {any} data
     */
    Angular2Csv.prototype.formartData = function (data) {
        if (this._options.decimalseparator === 'locale' && this.isFloat(data)) {
            return data.toLocaleString();
        }
        if (this._options.decimalseparator !== '.' && this.isFloat(data)) {
            return data.toString().replace('.', this._options.decimalseparator);
        }
        if (typeof data === 'string') {
            data = data.replace(/"/g, '""');
            if (this._options.quoteStrings || data.indexOf(',') > -1 || data.indexOf('\n') > -1 || data.indexOf('\r') > -1) {
                data = this._options.quoteStrings + data + this._options.quoteStrings;
            }
            return data;
        }
        if (typeof data === 'boolean') {
            return data ? 'TRUE' : 'FALSE';
        }
        return data;
    };
    /**
     * Check if is Float
     * @param {any} input
     */
    Angular2Csv.prototype.isFloat = function (input) {
        return +input === input && (!isFinite(input) || Boolean(input % 1));
    };
    return Angular2Csv;
}());
exports.Angular2Csv = Angular2Csv;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
/**
 * Convet to Object
 * @param {any} val
 */
function toObject(val) {
    if (val === null || val === undefined) {
        throw new TypeError('Object.assign cannot be called with null or undefined');
    }
    return Object(val);
}
/**
 * Assign data  to new Object
 * @param {any}   target
 * @param {any[]} ...source
 */
function objectAssign(target) {
    var source = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        source[_i - 1] = arguments[_i];
    }
    var from;
    var to = toObject(target);
    var symbols;
    for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
                to[key] = from[key];
            }
        }
        if (Object.getOwnPropertySymbols) {
            symbols = Object.getOwnPropertySymbols(from);
            for (var i = 0; i < symbols.length; i++) {
                if (propIsEnumerable.call(from, symbols[i])) {
                    to[symbols[i]] = from[symbols[i]];
                }
            }
        }
    }
    return to;
}
