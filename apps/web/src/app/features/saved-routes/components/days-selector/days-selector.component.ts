import { Component, model } from '@angular/core';

interface WeekdayOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-days-selector',
  templateUrl: './days-selector.component.html',
})
export class DaysSelectorComponent {
  readonly days = model<string[]>([]);

  readonly weekdays: readonly WeekdayOption[] = [
    { value: 'monday', label: 'Segunda' },
    { value: 'tuesday', label: 'Terça' },
    { value: 'wednesday', label: 'Quarta' },
    { value: 'thursday', label: 'Quinta' },
    { value: 'friday', label: 'Sexta' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' },
  ];

  toggleDay(day: string): void {
    this.days.update((selectedDays) =>
      selectedDays.includes(day)
        ? selectedDays.filter((selectedDay) => selectedDay !== day)
        : [...selectedDays, day],
    );
  }
}
