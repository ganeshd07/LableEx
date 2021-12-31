import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[appRestrictLengthInput]'
})
export class RestrictInputLengthDirective implements OnInit {

    constructor(private el: ElementRef) { }

    @Input('appRestrictLengthInput') length: number;

    ngOnInit() { }

    ngDoCheck() {
        this.validateInputLength();
    }

    validateInputLength() {
        const inputVal = this.el.nativeElement.value;
        if (inputVal.toString().length > this.length) {
            this.el.nativeElement.value = inputVal.toString().slice(0, this.length);
        }
    }
}
