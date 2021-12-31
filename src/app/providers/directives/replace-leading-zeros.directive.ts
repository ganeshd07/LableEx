import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[replaceLeadingZeros]',
})
export class ReplaceLeadingZerosDirective {
  @HostListener('input', ['$event'])
  onKeyDown(ev: KeyboardEvent) {
    const input = ev.target as HTMLInputElement;
    input.value = String(parseInt(input.value));
  }
}