// ============================================================
// src/modules/portal/domain/entities/portal.entity.ts
// ============================================================

import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { ColorHexVO } from "@/common/domain/values-objects/color-hex/color-hex.vo";
import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { UrlVO } from "@/common/domain/values-objects/url/url.vo";

export interface PortalProps {
  organizationId: UUIDVO;
  name: string;
  slug: SlugVO;
  type?: string;
  redirectUrl?: UrlVO | null;
  htmlContent?: string | null;
  description?: string | null;
  isActive: boolean;
  customCss?: string | null;
  logoUrl?: UrlVO | null;
  primaryColor: ColorHexVO;
  backgroundColor: ColorHexVO;
  showPlans: boolean;
  showLgpd: boolean;
  whatsappEnabled: boolean;
  whatsappTemplate?: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export class PortalEntity extends BaseAggregate<PortalProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get type() {
    return this.props.type ?? "basico";
  }
  get redirectUrl() {
    return this.props.redirectUrl;
  }
  get htmlContent() {
    return this.props.htmlContent;
  }
  get description() {
    return this.props.description;
  }
  get isActive() {
    return this.props.isActive;
  }
  get customCss() {
    return this.props.customCss;
  }
  get logoUrl() {
    return this.props.logoUrl;
  }
  get primaryColor() {
    return this.props.primaryColor;
  }
  get backgroundColor() {
    return this.props.backgroundColor;
  }
  get showPlans() {
    return this.props.showPlans;
  }
  get showLgpd() {
    return this.props.showLgpd;
  }
  get whatsappEnabled() {
    return this.props.whatsappEnabled;
  }
  get whatsappTemplate() {
    return this.props.whatsappTemplate;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  activate(): void {
    this.props.isActive = true;
    this.touch();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  enableWhatsapp(): void {
    this.props.whatsappEnabled = true;
    this.touch();
  }

  updateTheme(primaryColor: ColorHexVO, backgroundColor: ColorHexVO): void {
    this.props.primaryColor = primaryColor;
    this.props.backgroundColor = backgroundColor;
    this.touch();
  }

  updateContent(htmlContent: string, customCss?: string): void {
    this.props.htmlContent = htmlContent;
    if (customCss) this.props.customCss = customCss;
    this.touch();
  }

  isActivePortal(): boolean {
    return this.props.isActive;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      PortalProps,
      | "createdAt"
      | "updatedAt"
      | "type"
      | "isActive"
      | "showPlans"
      | "showLgpd"
      | "whatsappEnabled"
    >,
    id?: UUIDVO,
  ) {
    return new PortalEntity(
      {
        ...props,
        type: props.type ?? "basico",
        isActive: props.isActive ?? true,
        showPlans: props.showPlans ?? false,
        showLgpd: props.showLgpd ?? true,
        whatsappEnabled: props.whatsappEnabled ?? false,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
