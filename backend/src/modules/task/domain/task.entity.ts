import { DomainError } from "../../../shared/errors/base.errors";

export type TaskStatus = 'TODO' | 'DOING' | 'DONE' | 'BLOCKED' | 'OVERDUE';
export type Priority = 'P1' | 'P2' | 'P3';

export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  projectId?: string;
  priority: Priority;
  status: TaskStatus;
  deadline: Date;
  estimatedEffort: number;
  actualEffort?: number;
  blockerReason?: string;
  blockedAt?: Date;
  startedAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export class Task {
  private constructor(private readonly props: TaskProps) {}

  public static create(props: TaskProps): Task {
    this.validate(props);
    return new Task(props);
  }

  private static validate(props: TaskProps) {
    if (!props.title) throw new DomainError("Title is required");
    if (!props.ownerId) throw new DomainError("Owner is required");
    if (!props.deadline) throw new DomainError("Deadline is required");
    if (props.status === 'BLOCKED' && !props.blockerReason) {
      throw new DomainError("Blocked status requires a blocker reason");
    }
    if (props.estimatedEffort <= 0) {
        throw new DomainError("Estimated effort must be greater than 0");
    }
  }

  public getProps(): TaskProps {
    return { ...this.props };
  }

  public transitionTo(newStatus: TaskStatus, reason?: string): void {
    const currentStatus = this.props.status;

    if (newStatus === currentStatus) return;

    // Allowed transitions:
    // Todo → Doing
    // Doing → Done
    // Doing → Blocked
    // Blocked → Doing
    // Any → Overdue (system-triggered)

    const isAllowed = 
      (currentStatus === 'TODO' && newStatus === 'DOING') ||
      (currentStatus === 'DOING' && newStatus === 'DONE') ||
      (currentStatus === 'DOING' && newStatus === 'BLOCKED') ||
      (currentStatus === 'BLOCKED' && newStatus === 'DOING') ||
      (newStatus === 'OVERDUE');

    if (!isAllowed) {
      throw new DomainError(`Invalid transition from ${currentStatus} to ${newStatus}`);
    }

    if (newStatus === 'BLOCKED' && !reason) {
      throw new DomainError("Blocked status requires a reason");
    }

    this.props.status = newStatus;

    if (newStatus === 'BLOCKED') {
      this.props.blockerReason = reason;
      this.props.blockedAt = new Date();
    } else if (currentStatus === 'BLOCKED' && newStatus === 'DOING') {
      this.props.blockerReason = undefined;
      this.props.blockedAt = undefined;
    }

    if (newStatus === 'DOING' && !this.props.startedAt) {
      this.props.startedAt = new Date();
    }

    if (newStatus === 'DONE') {
      this.props.completedAt = new Date();
    }
  }

  public checkOverdue(): void {
    if (this.props.status !== 'DONE' && this.props.deadline < new Date()) {
      this.transitionTo('OVERDUE');
    }
  }
}
