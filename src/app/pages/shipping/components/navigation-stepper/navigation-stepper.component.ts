import { Component, OnInit, Input } from '@angular/core';
import { StepTypes } from '../../../../types/enum/step-type.enum';

@Component({
  selector: 'app-navigation-stepper',
  templateUrl: './navigation-stepper.component.html',
  styleUrls: ['./navigation-stepper.component.scss'],
})
export class NavigationStepperComponent implements OnInit {
  @Input() currentStep;
  menu: any = new Array();

  constructor() {
    this.menu = [
      StepTypes.STEP1,
      StepTypes.STEP2,
      StepTypes.STEP3,
      StepTypes.STEP4,
      StepTypes.STEP5
    ];
  }

  ngOnInit() { }

  getStatus(Prevstep) {
    return (Prevstep > this.currentStep) ? 'half-complete' : 'finish';
  }
}
