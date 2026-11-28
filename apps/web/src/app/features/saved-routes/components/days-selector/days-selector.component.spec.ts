import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DaysSelectorComponent } from './days-selector.component';

@Component({
  imports: [DaysSelectorComponent],
  template: '<app-days-selector [(days)]="selectedDays" />',
})
class DaysSelectorHostComponent {
  readonly selectedDays = signal<string[]>([]);
}

describe('DaysSelectorComponent', () => {
  let fixture: ComponentFixture<DaysSelectorHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaysSelectorHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DaysSelectorHostComponent);
    fixture.detectChanges();
  });

  it('deve apresentar os sete dias da semana, de Segunda a Domingo', () => {
    const legend = fixture.debugElement.query(By.css('legend')).nativeElement as HTMLLegendElement;
    expect(legend.classList).toContain('font-label');
    expect(legend.classList).toContain('text-label');
    expect(legend.classList).toContain('font-semibold');

    const labels = fixture.debugElement
      .queryAll(By.css('button'))
      .map((button) => (button.nativeElement as HTMLButtonElement).textContent?.trim());

    expect(labels).toEqual(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']);
    const firstButton = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;
    expect(firstButton.classList).toContain('font-body');
    expect(firstButton.classList).toContain('text-body');
    expect(firstButton.classList).toContain('font-medium');
  });

  it('deve selecionar múltiplos dias e sincronizá-los com model()', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    (buttons[0].nativeElement as HTMLButtonElement).click();
    (buttons[6].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedDays()).toEqual(['monday', 'sunday']);
    expect(buttons[0].nativeElement.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[6].nativeElement.getAttribute('aria-pressed')).toBe('true');
  });

  it('deve refletir alterações externas e permitir desmarcar um dia', () => {
    fixture.componentInstance.selectedDays.set(['tuesday']);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons[1].nativeElement.getAttribute('aria-pressed')).toBe('true');

    (buttons[1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedDays()).toEqual([]);
    expect(buttons[1].nativeElement.getAttribute('aria-pressed')).toBe('false');
  });
});
