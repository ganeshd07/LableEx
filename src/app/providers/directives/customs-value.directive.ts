import { ValidatorFn, AbstractControl } from '@angular/forms';

export function customsValueValidator(isRequiredCustomValue: boolean): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const required = isRequiredCustomValue && control.value < 1;
        return required ? { customsValError: { value: control.value } } : null;
    };
}

export function customsWeightValueValidator(isRequiredCustomWeightValue: boolean): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const required = isRequiredCustomWeightValue && control.value < 0.01;
        return required ? { customsValueError: { value: control.value } } : null;
    };
}
