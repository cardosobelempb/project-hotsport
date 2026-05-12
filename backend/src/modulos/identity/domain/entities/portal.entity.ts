import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

export interface PortalProps {
  organizationId: UUIDVO;
  name: string;
  slug: string;
  isActive?: boolean;
  primaryColor: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export class PortalEntity extends BaseAggregate<PortalProps> {
  get isActive() {
    return this.props.isActive ?? true;
  }

  activate(): void {
    this.props.isActive = true;
    this.touch();
  }
  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create() {}
}
