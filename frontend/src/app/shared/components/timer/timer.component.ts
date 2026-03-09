import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { interval, Subscription } from 'rxjs';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, MatIconModule, TimeFormatPipe],
  templateUrl: './timer.component.html',
  styles: [`
    .timer-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.2rem;
      font-variant-numeric: tabular-nums;
    }
    .timer-normal {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .timer-warning {
      background: #fff3e0;
      color: #e65100;
    }
    .timer-danger {
      background: #ffebee;
      color: #c62828;
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `],
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() totalSeconds: number = 0;
  @Input() countDown: boolean = true;
  @Input() warningThreshold: number = 300;
  @Input() dangerThreshold: number = 60;
  @Input() autoStart: boolean = true;

  @Output() timeUp = new EventEmitter<void>();
  @Output() tick = new EventEmitter<number>();

  currentSeconds: number = 0;
  isRunning: boolean = false;
  private timerSubscription?: Subscription;

  ngOnInit(): void {
    this.currentSeconds = this.countDown ? this.totalSeconds : 0;
    if (this.autoStart) {
      this.start();
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.countDown) {
        this.currentSeconds--;
        this.tick.emit(this.totalSeconds - this.currentSeconds);
        if (this.currentSeconds <= 0) {
          this.currentSeconds = 0;
          this.stop();
          this.timeUp.emit();
        }
      } else {
        this.currentSeconds++;
        this.tick.emit(this.currentSeconds);
      }
    });
  }

  stop(): void {
    this.isRunning = false;
    this.timerSubscription?.unsubscribe();
  }

  reset(): void {
    this.stop();
    this.currentSeconds = this.countDown ? this.totalSeconds : 0;
  }

  getTimerClass(): string {
    if (this.countDown) {
      if (this.currentSeconds <= this.dangerThreshold) return 'timer-danger';
      if (this.currentSeconds <= this.warningThreshold) return 'timer-warning';
    }
    return 'timer-normal';
  }
}
