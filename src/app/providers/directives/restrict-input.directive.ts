import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../types/constants/input-type-constants';

@Directive({
    selector: '[appRestrictInput]'
})
export class RestrictInputDirective implements OnInit {

    constructor(private el: ElementRef) { }

    @Input('appRestrictInput') type: string;
    ngOnInit() { }

    ngDoCheck() {
        this.validateInputData();
    }

    validateInputData() {
        switch (this.type) {
            case InputTypeConstants.ASCII:
                const inputTxtVal = this.el.nativeElement.value;
                this.el.nativeElement.value = inputTxtVal?.replace(/[^\x00-\x7F]/g, '');

                break;
            case InputTypeConstants.ALPHANUMWITHSYMBOLSONLY:
                const inputVal = this.el.nativeElement.value;
                let pattern = new RegExp('^[ A-Za-z0-9_@.,&+-]*$');
                let isValid = pattern.test(inputVal);
                if (isValid) {
                    this.el.nativeElement.value = inputVal;
                } else {
                    this.el.nativeElement.value = '';
                }
                break;
            case InputTypeConstants.ASCIIWITHLOCALLANG:
                const inputComplexVal = this.el.nativeElement.value;
                if (this.isChinese(inputComplexVal) === false) {
                    this.el.nativeElement.value = inputComplexVal?.replace(/[^\x00-\x7F]/g, '');
                }
                break;
            case InputTypeConstants.NUMBER:
                const inputNumVal = this.el.nativeElement.value;
                this.el.nativeElement.value = inputNumVal?.replace(/[^0-9]+/g, '');
                break;
            case InputTypeConstants.NUMBERWITHTWODECIMALSONLY:
                const inputValue = this.el.nativeElement.value;
                const val = !!inputValue && Math.abs(inputValue) >= 0 ? inputValue : '';
                if (val) {
                    let decimalPattern = new RegExp('^[0-9]+([\u002e][0-9]{1,2})?$');
                    const str = String(val).split('.');
                    if (!decimalPattern.test(String(val)) && str[1].length > 2) {
                        const decimalStr = str[1]?.substr(0, 2);
                        this.el.nativeElement.value = Number(str[0] + '.' + decimalStr);
                    } else {
                        this.el.nativeElement.value = val;
                    }
                }

                break;
            //TODO: can add more type of inputs
            default:
        }
    }

    isChinese(str: string) {
        return /^[\u4E00-\u9FA5]+$/.test(str);
    }
}
